import type { RecordOf } from 'immutable';

import type { ApiGifResultJSON } from 'flavours/glitch/api_types/gif';

type GifResultShape = Required<ApiGifResultJSON>;
export type GifResult = RecordOf<GifResultShape>;
