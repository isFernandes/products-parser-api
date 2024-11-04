import { schedule } from "node-cron";
import { ImportService } from "../services";
import { Container } from "typedi";
import { emitEventStream } from "../events/import.events";

const importService = Container.get<ImportService>("importService");

export const productSync = schedule("0 */2 * * * *", async () => {
  await importService.importData().catch((error) => {
    emitEventStream.emit("import:error", error);
  });
});
