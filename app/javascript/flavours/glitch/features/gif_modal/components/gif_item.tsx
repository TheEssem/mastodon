import { useCallback } from 'react';

import type { GifResult } from 'flavours/glitch/models/gif';

export const GifItem: React.FC<{
  gif: GifResult;
  onSelect: (arg0: GifResult) => void;
  disabled: boolean;
}> = ({ gif, onSelect, disabled }) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSelect(gif);
      }
    },
    [gif, onSelect],
  );

  return (
    <div className='media-gallery__item media-gallery__item--square'>
      <button
        className='media-gallery__item-thumbnail'
        onClick={handleClick}
        disabled={disabled}
        type='button'
      >
        <div className='media-gallery__gifv'>
          <video
            className='media-gallery__item-gifv-thumbnail'
            aria-label={gif.description}
            src={gif.url}
            autoPlay
            playsInline
            loop
            muted
          />
        </div>
      </button>
    </div>
  );
};
