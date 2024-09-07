export type ConnectionSource = HTTPConnectionSource | JSConnectionSource;

/**
 * Represents a connection source via HTTP.
 */
export interface HTTPConnectionSource {
    /**
     * The base URL for the wallet's universal link, which supports
     */
    universalLink: string;

    /**
     * The URL for the wallet's implementation of the
     */
    bridgeLink: string;
}

/**
 * Represents a connection source via JavaScript bridge.
 */
export interface JSConnectionSource {
    /**
     * The key used to access the JS Bridge object from the `window` object.
     * For example, a key of "tonkeeper" would allow access via `window.tonkeeper`.
     */
    bridgeKey: string;
}

/**
 * Type guard to check if a connection source is of type `JSConnectionSource`.
 *
 * @param source - The connection source to check.
 * @returns `true` if the source is a `JSConnectionSource`, otherwise `false`.
 */
export function isJSConnectionSource(
    source: ConnectionSource
): source is JSConnectionSource {
    return 'bridgeKey' in source;
}
