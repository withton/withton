/**
 * Removes the trailing slash from the provided URL if it exists.
 *
 * @param url - The URL string to be processed.
 * @returns A new URL string without a trailing slash.
 */
export function removeTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Adds the given path to the provided URL, ensuring there is exactly one slash between them.
 *
 * @param url - The base URL to which the path will be appended.
 * @param path - The path to append to the URL.
 * @returns The full URL with the path appended.
 */
export function appendPathToUrl(url: string, path: string): string {
  const normalizedUrl = removeTrailingSlash(url);
  return `${normalizedUrl}/${path.startsWith("/") ? path.slice(1) : path}`;
}

/**
 * Determines if the provided link is a valid Telegram URL.
 *
 * @param link - The link to be checked.
 * @returns `true` if the link is a Telegram URL, otherwise `false`.
 */
export function isTelegramLink(link?: string): boolean {
  if (!link) return false;

  try {
    const { protocol, hostname } = new URL(link);
    return protocol === "tg:" || hostname === "t.me";
  } catch {
    return false; // Return false if URL parsing fails
  }
}

/**
 * Encodes special characters in the provided Telegram URL parameters.
 *
 * @param parameters - The URL parameters to encode.
 * @returns The encoded parameters.
 */
export function encodeTelegramParams(parameters: string): string {
  const replacements: Record<string, string> = {
    ".": "%2E",
    "-": "%2D",
    _: "%5F",
    "&": "-",
    "=": "__",
    "%": "--",
  };

  return parameters.replace(/[.\-_&=%]/g, (char) => replacements[char] || char);
}
