export interface SessionInfo {
  ArchiveStatus: ArchiveStatus;
  EndDate: string;
  GmtOffset: string;
  Key: number;
  Meeting: Meeting;
  Name: string;
  Number: number;
  Path: string;
  SessionStatus: string;
  StartDate: string;
  Type: string;
  _kf: boolean;
}

export interface ArchiveStatus {
  Status: string;
}

export interface Meeting {
  Key: number;
  Circuit: Circuit;
  Country: Country;
  Location: string;
  Name: string;
  Number: number;
  OfficialName: string;
}

export interface Circuit {
  Key: number;
  ShortName: string;
}

export interface Country {
  Code: string;
  Key: number;
  Name: string;
}
