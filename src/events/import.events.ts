import { EventEmitter } from "events";

export const emitScream = new EventEmitter();

emitScream.on("import:error", (erro) => {
  console.error("import error:::", erro);
});
