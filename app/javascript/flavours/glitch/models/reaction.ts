import type { RecordOf } from 'immutable';
import { Record } from 'immutable';

import type { ApiStatusReactionJSON } from 'flavours/glitch/api_types/reaction';

type StatusReactionShape = Required<ApiStatusReactionJSON>;
export type StatusReaction = RecordOf<StatusReactionShape>;

export const CustomEmojiFactory = Record<StatusReactionShape>({
  name: '',
  static_url: '',
  url: '',
});
