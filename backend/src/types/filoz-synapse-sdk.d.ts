declare module '@filoz/synapse-sdk' {
  export const Synapse: new (config: { rpcUrl: string }) => unknown;
  export const createClient: (config: { rpcUrl: string }) => unknown;
  const defaultExport: unknown;
  export default defaultExport;
}
