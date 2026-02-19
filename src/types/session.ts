export interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  signedIn?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SessionInfo {
  id?: string;
  ipAddress?: string;
  createdAt?: string;
  expiredAt?: string;
}
