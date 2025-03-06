import type { ApiAccountJSON } from './accounts';

export interface ApiStatusReactionJSON {
  name: string;
  static_url?: string | undefined;
  url?: string | undefined;
  count?: number;
  account?: ApiAccountJSON;
}
