// drawResults.js
import protobuf from "protobufjs";
import { getHandler } from "./MGPEClient";

export async function getDrawResults(gameTypeId, gameId, startDate, endDate) {
  const root = await protobuf.load("/protos/GameResult.proto");

  const ReqDrawResult = root.lookupType("net.mpos.portal.entry.ReqDrawResult");
  const ResDrawResult = root.lookupType("net.mpos.portal.entry.ResDrawResult");

  const axiosInstance = getHandler(ReqDrawResult, ResDrawResult);

  const message = {
    gameTypeId,
    gameId,
    startTime: startDate,
    endTime: endDate,
  };

  return axiosInstance.post(
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
}
