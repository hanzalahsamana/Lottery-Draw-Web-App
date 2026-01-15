import { useEffect, useState, useRef, useCallback } from "react";
import protobuf from "protobufjs";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getHandler } from "./MGPEClient";

const MGPE_URL = import.meta.env.VITE_REACT_APP_MGPE;
const MGPE_TOKEN = import.meta.env.VITE_REACT_APP_MGPE_AUTH_TOKEN;
const RABBIT_WS = import.meta.env.VITE_REACT_APP_RABBITMQ_WS;
const RABBIT_TOPIC = import.meta.env.VITE_REACT_APP_RABBITMQ_STOMP_TOPIC;
const RABBIT_USER = import.meta.env.VITE_REACT_APP_RABBITMQ_USER;
const RABBIT_PASS = import.meta.env.VITE_REACT_APP_RABBITMQ_PASS;
const RABBIT_HOST = import.meta.env.VITE_REACT_APP_RABBITMQ_HOST;
const PROTO_PATH = ["/protos/GameResult.proto", "/protos/GameEnquery.proto"];

export default function useGameDraws() {
  const [gameMeta, setGameMeta] = useState(null);
  const [lastDraws, setLastDraws] = useState([]); // newest first
  const rootRef = useRef(null);
  const stompClientRef = useRef(null);

  // keep only last 5 draws
  const pushDraw = useCallback((draw) => {
    setLastDraws((prev) => {
      const deduped = prev.filter(
        (d) => !(d.draw_no && draw.draw_no && d.draw_no === draw.draw_no)
      );
      return [draw, ...deduped].slice(0, 5);
    });
  }, []);

  // load protos
  useEffect(() => {
    let canceled = false;
    protobuf
      .load(PROTO_PATH)
      .then((root) => {
        if (canceled) return;
        rootRef.current = root;
      })
      .catch((err) => {
        console.error("Failed to load proto files", err);
      });
    return () => {
      canceled = true;
    };
  }, [PROTO_PATH]);

  const fetchGameMeta = useCallback(async (gameId) => {
    if (!rootRef.current) throw new Error("proto not loaded");
    const ReqGameEnquery = rootRef.current.lookupType(
      "net.mpos.portal.entry.ReqGameEnquery"
    );
    const ResGameEnquery = rootRef.current.lookupType(
      "net.mpos.portal.entry.ResGameEnquery"
    );

    const payload = ReqGameEnquery.create({ game_id: gameId });
    const buffer = ReqGameEnquery.encode(payload).finish();
    const res = await fetch(MGPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-protobuf",
        Accept: "application/x-protobuf",
        ...(import.meta.env.REACT_APP_MGPE_AUTH_TOKEN
          ? {
              Authorization: `Bearer ${
                import.meta.env.REACT_APP_MGPE_AUTH_TOKEN
              }`,
            }
          : {}),
      },
      body: buffer,
    });

    if (!res.ok) throw new Error("MGPE meta fetch failed " + res.status);
    const buf = new Uint8Array(await res.arrayBuffer());
    const decoded = ResGameEnquery.decode(buf);
    return decoded;
  }, []);

  // Helper: fetch initial draw results via ReqDrawResult -> ResDrawResult
  const fetchInitialDraws = useCallback(async (gameId, count = 5) => {
    try {
      if (!rootRef.current) throw new Error("proto not loaded");

      const ReqDrawResult = rootRef.current.lookupType(
        "net.mpos.portal.entry.ReqDrawResult"
      );
      const ResDrawResult = rootRef.current.lookupType(
        "net.mpos.portal.entry.ResDrawResult"
      );

      const axiosInstance = getHandler(ReqDrawResult, ResDrawResult);

      const message = {
        gameTypeId: 1,
        gameId: String(gameId),
        startTime: 20260101000000,
        endTime: 20260114000000,
      };

      const fullResponce = await axiosInstance.post(
        "https://demo.alotsystems.com:8000/MGPE/MGPECorePortal",
        message,
        {
          headers: {
            "Content-Type": "application/x-protobuf",
            Accept: "application/json, text/plain, */*",
            protocal_version: "1.0",
            system_id: "1",
            trans_type: "680",
            timestamp: String(Date.now()),
            trace_message_id: `${Date.now()}_680/1`,
          },
          responseType: "arraybuffer",
        }
      );

      const responce = fullResponce?.data;

      const results = responce.drawResultInfo || [];
      const mapped = results.map((r) => ({
        gameId: r.gameId,
        drawNo: r.drawNo,
        timestamp: r.drawDate || Date.now(),
        resultNo: r.resultNo || null,
        presentResultString: r.presentResultString || [],
        gameTypeId: r.gameTypeId,
        gameName: r.gameName,
      }));

      return { raw: responce, results: mapped.slice(0, 10) };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get("gameId");
        if (!gameId) {
          console.warn("No gameId in URL");
          return;
        }

        const waitForProto = () =>
          new Promise((res) => {
            const t = setInterval(() => {
              if (rootRef.current) {
                clearInterval(t);
                res();
              }
            }, 100);
          });
        await waitForProto();

        // const metaDecoded = await fetchGameMeta(gameId);
        // setGameMeta(metaDecoded);

        const initial = await fetchInitialDraws(gameId, 5);
        console.log("🚀 ~ init ~ initial:", initial?.results);
        // newest first
        setLastDraws(initial.results);
      } catch (e) {
        console.error("init error", e);
      }
    };
    init();
  }, [fetchGameMeta, fetchInitialDraws]);

  // Setup STOMP websocket subscription for live updates
  useEffect(() => {
    if (!rootRef.current) return;

    const ResDrawResult = rootRef.current.lookupType(
      "net.mpos.portal.entry.ResDrawResult"
    );

    const client = new Client();
    client.configure({
      brokerURL: RABBIT_WS,
      connectHeaders: {
        login: RABBIT_USER || "",
        passcode: RABBIT_PASS || "",
        host: RABBIT_HOST,
      },
      reconnectDelay: 5000,
      onConnect: (e) => {
        console.log("🚀 ~ useGameDraws ~ message:", e);
        const sub = client.subscribe(RABBIT_TOPIC, (message) => {
          // StompJS exposes binaryBody for binary frames
          const body = message.binaryBody || message.body;
          if (!body) return;
          let uint8;
          if (body instanceof ArrayBuffer) uint8 = new Uint8Array(body);
          else if (Array.isArray(body)) uint8 = new Uint8Array(body);
          else if (typeof body === "string") {
            // If server sends base64 encoded string, decode:
            try {
              const str = atob(body);
              const arr = new Uint8Array(str.length);
              for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
              uint8 = arr;
            } catch (_e) {
              // fallback: use text encoder
              uint8 = new TextEncoder().encode(body);
            }
          } else {
            console.warn("unknown message body type", typeof body);
            return;
          }

          try {
            const decoded = ResDrawResult.decode(uint8);
            // decoded.drawResultInfo is repeated list; push each draw
            if (
              decoded &&
              decoded.drawResultInfo &&
              decoded.drawResultInfo.length
            ) {
              decoded.drawResultInfo.forEach((d) => {
                const mapped = {
                  game_id: d.game_id,
                  draw_no: d.draw_no,
                  timestamp: d.drawDate || Date.now(),
                  resultNo: d.resultNo || null,
                  presentResultString: d.presentResultString || [],
                };
                // optionally filter by gameId in URL
                const params = new URLSearchParams(window.location.search);
                const urlGameId = params.get("gameId");
                if (!urlGameId || urlGameId === mapped.game_id)
                  pushDraw(mapped);
              });
            }
          } catch (err) {
            console.error("Failed to decode incoming draw proto", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      try {
        stompClientRef.current && stompClientRef.current.deactivate();
      } catch (e) {}
    };
  }, [pushDraw]);

  return { gameMeta, lastDraws };
}
