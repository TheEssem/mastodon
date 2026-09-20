import type { ApiStatusReactionJSON } from 'flavours/glitch/api_types/reaction';

type StatusReactionShape = Required<ApiStatusReactionJSON>;
export interface StatusReaction extends Omit<StatusReactionShape, 'account'> {
  account: string;
}

export type StatusReactionMap = Immutable.Map<string, unknown>;
