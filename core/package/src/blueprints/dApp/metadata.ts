/**
 * Represents the metadata associated with a decentralized application (DApp).
 * Provides key details for UI and connection purposes.
 */
export interface DAppMetaData {
  /**
   * The name of the decentralized application.
   */
  name?: string;

  /**
   * A URL pointing to the DApp's icon or logo image.
   * Should be a valid URL (preferably HTTPS) that can be used in UI components.
   */
  icon?: string;

  /**
   * A URL linking to the DApp's official website or relevant interaction point.
   * Should follow standard URL format.
   */
  link?: string;
}
