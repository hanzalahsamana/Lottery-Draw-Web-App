// mgpeClient.js
import axios from 'axios';
import protobuf from 'protobufjs';

export function getHandler(reqType, resType) {
  const instance = axios.create();

  instance.interceptors.request.use((config) => {
    if (config.data && reqType) {
      const message = reqType.create(config.data);
      config.data = new Uint8Array(reqType.encode(message).finish());
    }
    return config;
  });

  instance.interceptors.response.use((response) => {
    const responseCode = response.headers['response_code'];

    if (responseCode == 200 || responseCode == 6000) {
      if (response.data && resType) {
        response.data = resType.decode(new Uint8Array(response.data));
      }
    } else {
      console.error('MGPE Error:', response, JSON.stringify(response, null, 2));
    }

    return response;
  });

  return instance;
}
