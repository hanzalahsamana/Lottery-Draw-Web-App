import { useEffect, useState, useRef, useCallback } from 'react';
import protobuf from 'protobufjs';
import { Client } from '@stomp/stompjs';
import { getHandler } from '../apis/MGPEClient';
import { PROTO_PATH, RABBIT_WS, RABBIT_TOPIC, RABBIT_USER, RABBIT_PASS, RABBIT_HOST } from '../constants/constant';
import { getGameMetaData } from '../apis/getGameMetaData';
import { getDrawResults } from '../apis/getDrawResults';

export default function useGameDraws(gameId) {
  const [gameMeta, setGameMeta] = useState(null);
  const [lastDraws, setLastDraws] = useState([]);
  const [loading, setLoading] = useState([]);
  const [lotteryLoading, setLotteryLoading] = useState(false);

  const rootRef = useRef(null);
  const stompClientRef = useRef(null);

  const pushDraw = useCallback((draw) => {
    setLastDraws((prev) => {
      const deduped = prev.filter((d) => !(d.draw_no && draw.draw_no && d.draw_no === draw.draw_no));
      return [draw, ...deduped].slice(0, 5);
    });
  }, []);

  useEffect(() => {
    let canceled = false;
    protobuf
      .load(PROTO_PATH)
      .then((root) => {
        if (canceled) return;
        rootRef.current = root;
      })
      .catch((err) => {
        console.error('Failed to load proto files', err);
      });
    return () => {
      canceled = true;
    };
  }, [PROTO_PATH]);

  const fetchGameMeta = useCallback(async (gameId) => {
    try {
      if (!rootRef.current) throw new Error('proto not loaded');

      const ReqGameEnquery = rootRef.current.lookupType('net.mpos.portal.entry.ReqGameEnquery');
      const ResGameEnquery = rootRef.current.lookupType('net.mpos.portal.entry.ResGameEnquery');

      const axiosInstance = getHandler(ReqGameEnquery, ResGameEnquery);

      const message = {
        gameTypeId: 1,
        gameId: String(gameId),
        drawStatus: 2,
      };

      const responce = await getGameMetaData(axiosInstance, message);
      const results = responce.game || [];

      return results[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const fetchInitialDraws = useCallback(async (gameId) => {
    try {
      if (!rootRef.current) throw new Error('proto not loaded');

      const ReqDrawResult = rootRef.current.lookupType('net.mpos.portal.entry.ReqDrawResult');
      const ResDrawResult = rootRef.current.lookupType('net.mpos.portal.entry.ResDrawResult');

      const axiosInstance = getHandler(ReqDrawResult, ResDrawResult);

      const message = {
        gameTypeId: 1,
        gameId: String(gameId),
      };

      const responce = await getDrawResults(axiosInstance, message);

      const results = responce.drawResultInfo || [];

      return { results: results.slice(0, 5) };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const init = async (initialFetch = true) => {
    try {
      if (!gameId) {
        console.warn('No gameId in URL');
        return;
      }
      if (initialFetch) {
        setLoading(true);
      } else {
        setLotteryLoading(true);
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

      const metaDecoded = await fetchGameMeta(gameId);

      const dummy = {
        gameInstance: [
          {
            startSellingTime: '2026-02-11 07:15:00',
            endSellingTime: '2026-02-11 07:23:00',
            drawNo: '2c9f809f9953433d019955276c3e0003',
          },
        ],
      };
      setGameMeta(metaDecoded);

      const initial = await fetchInitialDraws(gameId, 5);
      setLastDraws(initial.results);

      return initial.results;
    } catch (e) {
      console.error('init error', e);
    } finally {
      setLoading(false);
      setLotteryLoading(false);
    }
  };
  useEffect(() => {
    init();
  }, [gameId, fetchGameMeta, fetchInitialDraws]);

  useEffect(() => {
    if (!rootRef.current) return;

    const ResDrawResult = rootRef.current.lookupType('net.mpos.portal.entry.ResDrawResult');

    const client = new Client();
    client.configure({
      brokerURL: RABBIT_WS,
      connectHeaders: {
        login: RABBIT_USER || '',
        passcode: RABBIT_PASS || '',
        host: RABBIT_HOST,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      logRawCommunication: false,
      onConnect: (e) => {
        const sub = client.subscribe(RABBIT_TOPIC, (message) => {
          const body = message.binaryBody || message.body;
          if (!body) return;
          let uint8;
          if (body instanceof ArrayBuffer) uint8 = new Uint8Array(body);
          else if (Array.isArray(body)) uint8 = new Uint8Array(body);
          else if (typeof body === 'string') {
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
            console.warn('unknown message body type', typeof body);
            return;
          }

          try {
            const decoded = ResDrawResult.decode(uint8);
            // decoded.drawResultInfo is repeated list; push each draw
            if (decoded && decoded.drawResultInfo && decoded.drawResultInfo.length) {
              decoded.drawResultInfo.forEach((d) => {
                const mapped = {
                  game_id: d.game_id,
                  draw_no: d.draw_no,
                  timestamp: d.drawDate || Date.now(),
                  resultNo: d.resultNo || null,
                  presentResultString: d.presentResultString || [],
                };
                if (!gameId || String(gameId) === String(mapped.game_id)) {
                  pushDraw(mapped);
                }
              });
            }
          } catch (err) {
            console.error('Failed to decode incoming draw proto', err);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      try {
        stompClientRef.current && stompClientRef.current.deactivate();
      } catch (e) {}
    };
  }, [gameId, gameMeta]);

  return { gameMeta, lastDraws, init, loading, lotteryLoading };
}
