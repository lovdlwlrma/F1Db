export type DriverList = Record<string, DriverInfo>;

export interface DriverInfo {
  BroadcastName: string;
  FirstName: string;
  FullName: string;
  HeadshotUrl: string;
  LastName: string;
  Line: number;
  PublicIdRight: string;
  RacingNumber: string;
  Reference: string;
  TeamColour: string;
  TeamName: string;
  Tla: string;
}
