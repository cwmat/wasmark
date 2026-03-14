export type TypstWorkerInbound = {
  type: "COMPILE_PDF";
  payload: { typstSource: string };
};

export type TypstWorkerOutbound =
  | { type: "INIT_COMPLETE" }
  | { type: "COMPILE_PROGRESS"; payload: { stage: string } }
  | { type: "COMPILE_COMPLETE"; payload: { pdfBytes: ArrayBuffer } }
  | { type: "COMPILE_ERROR"; payload: { message: string } };
