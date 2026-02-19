export interface CookieDetail {
  name: string;
  purpose: string;
  duration: string;
  type: string;
  provider: string;
}

export interface CookieCategoryData {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isEnabled: boolean;
  cookieCount: number;
  cookies: CookieDetail[];
}

export interface CookiePreferencesState {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}
