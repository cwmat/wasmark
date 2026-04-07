import type { TypstWorkerInbound, TypstWorkerOutbound } from "@/types/worker-messages";
import wasmUrl from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";

function post(msg: TypstWorkerOutbound) {
  self.postMessage(msg);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let typstInstance: any = null;

async function initTypst() {
  if (typstInstance) return typstInstance;

  post({ type: "COMPILE_PROGRESS", payload: { stage: "Loading WASM compiler..." } });

  try {
    const { $typst } = await import("@myriaddreamin/typst.ts/contrib/snippet");
    const { preloadFontAssets } = await import("@myriaddreamin/typst.ts/options.init");
    $typst.setCompilerInitOptions({
      getModule: () => wasmUrl,
      beforeBuild: [preloadFontAssets({ assets: ["text", "cjk", "emoji"] })],
    });
    typstInstance = $typst;
    post({ type: "INIT_COMPLETE" });
    return $typst;
  } catch (err) {
    console.error("[Typst Worker] Init failed:", err);
    post({
      type: "COMPILE_ERROR",
      payload: {
        message: `Failed to load Typst WASM compiler: ${(err as Error).message}. Install @myriaddreamin/typst.ts to enable PDF export.`,
      },
    });
    throw err;
  }
}

async function compilePdf(typstSource: string) {
  try {
    const compiler = await initTypst();
    post({ type: "COMPILE_PROGRESS", payload: { stage: "Compiling PDF..." } });

    const pdfBytes = await compiler.pdf({ mainContent: typstSource });
    const buffer = (pdfBytes.buffer ?? pdfBytes) as ArrayBuffer;

    post({
      type: "COMPILE_COMPLETE",
      payload: { pdfBytes: buffer },
    });
  } catch (err) {
    console.error("[Typst Worker] Compile failed:", err);
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    } else {
      message = String(err);
    }
    post({
      type: "COMPILE_ERROR",
      payload: { message },
    });
  }
}

self.onmessage = async (e: MessageEvent<TypstWorkerInbound>) => {
  const msg = e.data;
  switch (msg.type) {
    case "COMPILE_PDF":
      await compilePdf(msg.payload.typstSource);
      break;
  }
};
