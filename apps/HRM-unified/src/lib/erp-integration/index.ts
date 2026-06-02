// ============================================================
// HRM-Unified — ERP Ecosystem Integration Layer
// Bridges HRM module with shared ERP infrastructure
// ============================================================

export { publishHRMEvent, subscribeHRMEvents, initHRMEventHandlers } from './events';
export { checkFeatureAccess, HRM_FEATURES } from './features';
export { mapToMasterData, syncEmployeeToMasterData } from './master-data';
