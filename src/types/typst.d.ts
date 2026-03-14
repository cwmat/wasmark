declare module "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs" {
  export const $typst: {
    pdf: (opts: { mainContent: string }) => Promise<Uint8Array>;
    setCompilerInitOptions?: (opts: unknown) => Promise<void>;
  };
  export default $typst;
}
