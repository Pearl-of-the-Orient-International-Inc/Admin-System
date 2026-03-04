export interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt?: string;
  expiredAt?: string;
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

export interface BackendSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiredAt: string;
  isCurrent: boolean;
  location: {
    city: string | null;
    region: string | null;
    country: string | null;
    label: string;
    coordinates: {
      lat: number;
      lng: number;
    } | null;
  };
}
