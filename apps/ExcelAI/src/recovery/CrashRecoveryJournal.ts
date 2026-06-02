// Stub: CrashRecoveryJournal
const noop = (..._args: unknown[]) => {};

export const crashRecovery: Record<string, any> = new Proxy({}, {
  get: (_target, prop) => {
    if (prop === 'hasRecoveryData') return () => false;
    return noop;
  },
});
export default crashRecovery;
