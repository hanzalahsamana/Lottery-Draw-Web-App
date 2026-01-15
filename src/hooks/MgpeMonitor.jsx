import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from "sockjs-client";
import protobuf from 'protobufjs';

const PROTO_URL = "/protos/GameResult.proto";

const MgpeMonitor = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Disconnected');
  const [error, setError] = useState(null);

  let _stompClient = new Client();
  const exchangeName = '/exchange/high_freq_result_exchange'
  useEffect(() => {

    const setup = async () => {
      try {
        // 1. Verify File Access
        const response = await fetch(PROTO_URL);
        if (!response.ok) throw new Error(`Cannot find proto file at ${PROTO_URL}`);

        // 2. Load Protobuf with your specific package and type
        const root = await protobuf.load(PROTO_URL);

        // Match the 'package' and 'message' from your file
        const DrawResultType = root.lookupType("net.mpos.portal.entry.ResDrawResult");

        // 3. Setup STOMP Connection
        // const _stompClient = new Client();
        _stompClient.configure({
          brokerURL: 'wss://demo.alotsystems.com:15674/ws',
          connectHeaders: {
            login: 'SaimaB',
            passcode: 'irMP3K7JzJ4bJT9x',
            host: '/online_high_freq',
          },
          reconnectDelay: 500,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          logRawCommunication: false,
          onConnect: (a) => {
            console.log("🚀 ~ setup ~ a:", a, _stompClient);
            setStatus('Connected');
            setError(null);


            _stompClient.subscribe(exchangeName, (message) => {
              console.log('RAW message from', dest, message);
              if (message.binaryBody && DrawResultType) {
                try {
                  const decoded = DrawResultType.decode(message.binaryBody);
                  const obj = DrawResultType.toObject(decoded, {
                    longs: String,
                    enums: String,
                    defaults: true
                  });
                  onMessageDecoded(obj);
                } catch (decodeErr) {
                  console.error('Decode Error:', decodeErr);
                }
              } else {
                try {
                  const txt = message.body || '[no body]';
                  console.log('Text message:', txt);
                } catch (e) {
                  console.log('Message no body / unsupported format', e);
                }
              }
            });

          },
          onUnhandledMessage: (msg) => {
            console.log("🚀 ~ setup ~ onUnhandledMessage ~ msg:", msg)
          },
          onStompError: (f) => {
            return setError(`Auth/STOMP Error: ${f.headers['message']}`)
          },
          onWebSocketError: (e) => {
            console.log("🚀 ~ setup ~ e:", e)
            return setError('WebSocket failed. Check URL/Network.')
          }
        });

        _stompClient.activate();
      } catch (err) {
        console.error("Protobuf Setup Error:", err);
        setError(err.message);
      }
    };

    setup();
    return () => _stompClient?.deactivate();
  }, []);


  // const clickHandler = () => {
  //   _stompClient.publish({ destination: exchangeName, body: 'Hello world' });
  // }

  return (
    <div style={{ padding: '20px', background: '#222', color: '#fff', minHeight: '100vh' }}>
      <h2>MGPE Live Draw Results</h2>
      <div style={{ color: error ? 'red' : 'green', marginBottom: '10px' }}>
        Status: {status} {error && `| Error: ${error}`}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && <p>Listening for binary data...</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ background: '#333', padding: '15px', borderRadius: '8px', fontSize: '12px' }}>
            <strong>Game Type ID:</strong> {m.gameTypeId} <br />
            <strong>Desc:</strong> {m.responseDesc}
            <pre>{JSON.stringify(m.drawResultInfo || m.digitDrawResultInfo, null, 2)}</pre>
          </div>
        ))}
      </div>
      {/* <button onClick={clickHandler}> Car</button> */}
    </div>
  );
};

export default MgpeMonitor;
