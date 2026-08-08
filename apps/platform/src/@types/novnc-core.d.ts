// Type declarations for @novnc/novnc/core/rfb
// These extend the existing @types/novnc__novnc package

declare module "@novnc/novnc/core/rfb" {
  // Re-export everything from the lib/rfb module
  import RFBClass, { type NoVncCredentials, type NoVncOptions, type NoVncScreen } from "@novnc/novnc/lib/rfb";
  
  export type { NoVncCredentials, NoVncOptions, NoVncScreen };
  
  // The default export is the RFB/NoVncClient class
  const RFB: typeof RFBClass;
  export default RFB;
  
  // Also export as type RFB for convenience
  export type RFB = InstanceType<typeof RFBClass>;
}
