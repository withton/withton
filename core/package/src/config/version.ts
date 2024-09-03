/**
 * The version of the TON configuration, provided as a global constant.
 * This value is typically injected at build time.
 */
declare const WITH_TON_CONFIG_VERSION: string;
/**
 * Exported constant representing the current version of the TON configuration.
 * Use this constant to ensure consistent versioning across your application.
 */
export const tonConfigVersion: string = WITH_TON_CONFIG_VERSION;
