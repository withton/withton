export interface DisconnectEvent {
  eventType: "disconnect";
  eventId: number;
  data: Record<string, never>;
}
