import { MGPE_URL } from '../constants/constant';
import { generateTimestamp } from '../utils/dateUtil';

export const getGameMetaData = async (axiosInstance, payload) => {
  try {
    const responce = await axiosInstance.post(MGPE_URL, payload, {
      headers: {
        'Content-Type': 'application/x-protobuf',
        Accept: 'application/json, text/plain, */*',
        protocal_version: '1.0',
        system_id: '1',
        trans_type: '770',
        timestamp: String(generateTimestamp()),
        trace_message_id: `${generateTimestamp()}_770/1`,
      },
      responseType: 'arraybuffer',
    });

    return responce?.data;
  } catch (error) {
    throw error;
  }
};
