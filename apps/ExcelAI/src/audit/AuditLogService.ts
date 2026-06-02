// Stub: AuditLogService
const noop = (..._args: unknown[]) => {};

export const auditLog: Record<string, any> = new Proxy({}, {
  get: (_target, _prop) => noop,
});
export default auditLog;
