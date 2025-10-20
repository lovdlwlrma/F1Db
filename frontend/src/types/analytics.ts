export interface TeamStats {
  teamName: string;
  teamColor: string;
  points: number;
  drivers: Array<{
    driverNumber: number;
    name: string;
    position: number | undefined;
    points: number;
    dnf: boolean;
    dns: boolean;
    dsq: boolean;
  }>;
}
