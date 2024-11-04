import { EventEmitter } from "events";

export const emitEventStream = new EventEmitter();

emitEventStream.on("import:error", (erro) => {
  console.error("import error:::", erro);
});
