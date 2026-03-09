import { useEffect, useState, useRef, useCallback } from 'react';
import protobuf from 'protobufjs';
import { Client } from '@stomp/stompjs';
import { getHandler } from '../apis/MGPEClient';
import { PROTO_PATH, RABBIT_WS, RABBIT_USER, RABBIT_PASS, RABBIT_HOST } from '../constants/constant';
import { getGameMetaData } from '../apis/getGameMetaData';
import { getDrawResults } from '../apis/getDrawResults';

export default function useGameDraws(gameId) {
  const [protoLoaded, setProtoLoaded] = useState(false);
  const [last5Draws, setLast5Draws] = useState([]);
  const [nextDraw, setNextDraw] = useState({});
  const [currentDraw, setCurrentDraw] = useState({});
  const [startDrawOpening, setStartDrawOpening] = useState({});
  const [loading, setLoading] = useState(true);

  const rootRef = useRef(null);
  const stompClientRef = useRef(null);

  const pushDraw = useCallback((draw) => {
    setLast5Draws((prev) => {
      const filtered = prev.filter((d) => !(d.draw_no && draw.draw_no && d.draw_no === draw.draw_no));
      return [draw, ...filtered].slice(0, 5);
    });
  }, []);

  useEffect(() => {
    let canceled = false;
    const protoPath = PROTO_PATH;
    protobuf
      .load(protoPath)
      .then((root) => {
        if (canceled) return;
        rootRef.current = root;
        setProtoLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load proto:', err);
      });

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!gameId || !protoLoaded) return;

    const init = async () => {
      try {
        setLoading(true);

        const ReqGameEnquery = rootRef.current.lookupType('net.mpos.portal.entry.ReqGameEnquery');
        const ResGameEnquery = rootRef.current.lookupType('net.mpos.portal.entry.ResGameEnquery');

        const axiosMeta = getHandler(ReqGameEnquery, ResGameEnquery);

        const metaRes = await getGameMetaData(axiosMeta, {
          gameTypeId: 1,
          gameId: String(gameId),
          drawStatus: 2,
        });
        const gameInstance = metaRes?.game?.[0]?.gameInstance?.[0];
        const formattedNextDraw = {
          drawNo: gameInstance?.drawNo,
          drawDate: gameInstance?.drawDate,
          startSellingTime: gameInstance?.startSellingTime,
          endSellingTime: gameInstance?.endSellingTime,
        };

        setNextDraw(formattedNextDraw);

        const ReqDrawResult = rootRef.current.lookupType('net.mpos.portal.entry.ReqDrawResult');
        const ResDrawResult = rootRef.current.lookupType('net.mpos.portal.entry.ResDrawResult');

        const axiosDraw = getHandler(ReqDrawResult, ResDrawResult);

        const drawRes = await getDrawResults(axiosDraw, {
          gameTypeId: 1,
          gameId: String(gameId),
        });

        const formattedLastDraws = drawRes?.drawResultInfo?.map((row) => ({
          resultNo: row?.resultNo?.split(','),
          gameTypeName: row?.gameTypeName,
          drawDate: row?.drawDate,
          speciaNo: row?.speciaNo,
          drawNo: row?.drawNo,
        }));

        setCurrentDraw({ ...formattedLastDraws?.[0], status: 'opened' });
        setLast5Draws(formattedLastDraws.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [gameId, protoLoaded]);

  useEffect(() => {
    if (!protoLoaded) return;

    const DrawResultProto = rootRef.current.lookupType('net.mpos.portal.entry.ResDrawResult');
    const GameStartProto = rootRef.current.lookupType('net.mpos.portal.entry.GameStart');
    const GameStopProto = rootRef.current.lookupType('net.mpos.portal.entry.GameStop');

    const client = new Client({
      brokerURL: RABBIT_WS,
      connectHeaders: {
        login: RABBIT_USER || '',
        passcode: RABBIT_PASS || '',
        host: RABBIT_HOST,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        const topics = ['/exchange/high_freq_start_exchange', '/exchange/high_freq_result_exchange', '/exchange/high_freq_stop_exchange'];

        topics.forEach((topic) => {
          client.subscribe(topic, (message) => {
            try {
              let base64String;

              if (message.binaryBody) {
                base64String = new TextDecoder().decode(message.binaryBody);
              } else if (message.body) {
                base64String = message.body;
              } else {
                return;
              }

              if (topic === '/exchange/high_freq_result_exchange') {
                const resultDecode = decodeProtoData(base64String, DrawResultProto);
                console.log('🚀 ~ useGameDraws ~ resultDecode:', resultDecode, base64String);
                const resultInfo = resultDecode?.drawResultInfo?.[0];
                const formattedResult = {
                  resultNo: resultInfo?.resultNo?.split(','),
                  gameTypeName: resultInfo?.gameTypeName,
                  drawDate: resultInfo?.drawDate,
                  speciaNo: resultInfo?.speciaNo,
                  drawNo: resultInfo?.drawNo,
                };
                setStartDrawOpening(formattedResult);
              }
              if (topic === '/exchange/high_freq_start_exchange') {
                const gameStartDecode = decodeProtoData(base64String, GameStartProto);
                console.log('🚀 ~ useGameDraws ~ gameStartDecode:', gameStartDecode, base64String);
                const gameInstance = gameStartDecode?.gameInstance;

                const formattedNextDraw = {
                  drawNo: gameInstance?.drawNo,
                  drawDate: gameInstance?.drawDate,
                  startSellingTime: gameInstance?.startSellingTime,
                  endSellingTime: gameInstance?.endSellingTime,
                };

                setNextDraw(formattedNextDraw);
              }
              if (topic === '/exchange/high_freq_stop_exchange') {
                const gameStopDecode = decodeProtoData(base64String, GameStopProto);
                console.log('🚀 ~ useGameDraws ~ gameStopDecode:', gameStopDecode, base64String);
                const formattedCurrentDraw = {
                  resultNo: [],
                  gameTypeName: gameStopDecode?.gameInstanceName,
                  drawDate: gameStopDecode?.drawDate,
                  speciaNo: '',
                  drawNo: gameStopDecode?.drawNo,
                  status: 'waiting',
                };
                setCurrentDraw(formattedCurrentDraw);
                setNextDraw((prev) => {
                  if (prev?.drawNo === gameStopDecode?.drawNo) {
                    return {};
                  } else {
                    return prev;
                  }
                });
              }
            } catch (err) {
              console.error('WS decode error', err);
            }
          });
        });
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [gameId, protoLoaded, pushDraw]);

  function decodeProtoData(base64, ProtoFile) {
    const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const message = ProtoFile.decode(buffer);

    const obj = ProtoFile.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    });

    return obj;
  }

  return { last5Draws, setLast5Draws, currentDraw, setCurrentDraw, nextDraw, startDrawOpening, setStartDrawOpening, loading };
}
