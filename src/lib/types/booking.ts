export type Slot = {
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  reason?: string | null;
};

export enum SlotStatus {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  UNAVAILABLE = "UNAVAILABLE",
  CLOSED = "CLOSED",
}
