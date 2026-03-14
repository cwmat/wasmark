import type { TypstWorkerInbound, TypstWorkerOutbound } from "@/types/worker-messages";

function post(msg: TypstWorkerOutbound) {
  self.postMessage(msg);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let typstInstance: any = null;

/** Runtime-only dynamic import that Vite/Rollup won't try to resolve at build time */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runtimeImport(specifier: string): Promise<any> {
  return new Function("s", "return import(s)")(specifier);
}

async function initTypst() {
  if (typstInstance) return typstInstance;

  post({ type: "COMPILE_PROGRESS", payload: { stage: "Loading WASM compiler..." } });

  try {
    // Dynamic import at runtime only - typst.ts must be installed for PDF export
    const mod = await runtimeImport("@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs");
    const $typst = mod.$typst || mod.default;
    if ($typst) {
      typstInstance = $typst;
      post({ type: "INIT_COMPLETE" });
      return $typst;
    }
    throw new Error("Could not find $typst export");
  } catch (err) {
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
    post({
      type: "COMPILE_ERROR",
      payload: { message: (err as Error).message },
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
