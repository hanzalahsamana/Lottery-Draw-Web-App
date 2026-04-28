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

  instance.interceptors.response.use(
    (response) => {
      const responseCode = response.headers?.response_code;

      if (responseCode == 200 || responseCode == 6000) {
        if (response.data && resType) {
          response.data = resType.decode(new Uint8Array(response.data));
        }
        return response;
      }

      const error = new Error('MGPE API Error');
      error.response_code = responseCode || '500';
      error.response = response;
      return Promise.reject(error);
    },
    (error) => {
      const responseCode =
        error?.response?.headers?.response_code ||
        error?.response_code ||
        '500';

      error.response_code = responseCode;
      return Promise.reject(error);
    }
  );

  return instance;
}