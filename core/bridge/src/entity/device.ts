import { Operation } from './operation';

export interface DeviceInfo {
    platform: PlatformType;
    appName: string; // e.g., "Tonkeeper"
    appVersion: string; // e.g., "2.3.367"
    maxProtocolVersion: number;
    supportedOperations: Operation[];
}

export type PlatformType =
    | 'iOS'
    | 'Android'
    | 'Windows'
    | 'macOS'
    | 'Linux'
    | 'Web'
    | 'BrowserExtension';

export interface ConnectorInfo extends DeviceInfo {
    deviceName?: string; // e.g., "iPhone 12", optional for more specificity
    manufacturer?: string; // e.g., "Apple", optional for branding information
    isRootedOrJailbroken?: boolean; // optional field to indicate if the device is rooted/jailbroken
}
