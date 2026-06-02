/**
 * Insurance Module
 * BHXH (Social), BHYT (Health), BHTN (Unemployment), and Maternity benefits
 */

export * from "./bhxh.js";
export * from "./maternity.js";

import * as bhxh from "./bhxh.js";
import * as maternity from "./maternity.js";

export default {
  bhxh,
  maternity,
};
