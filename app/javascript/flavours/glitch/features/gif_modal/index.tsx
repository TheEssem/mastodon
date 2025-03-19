import { useCallback, useState, useRef, useEffect } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import type {
  Map as ImmutableMap,
  OrderedSet as ImmutableOrderedSet,
} from 'immutable';

import CancelIcon from '@/material-icons/400-24px/cancel-fill.svg?react';
import CloseIcon from '@/material-icons/400-24px/close.svg?react';
import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import { showAlertForError } from 'flavours/glitch/actions/alerts';
import {
  gifSearch,
  resetGifs,
  uploadCompose,
} from 'flavours/glitch/actions/compose';
import { CircularProgress } from 'flavours/glitch/components/circular_progress';
import { Icon } from 'flavours/glitch/components/icon';
import { IconButton } from 'flavours/glitch/components/icon_button';
import { GifItem } from 'flavours/glitch/features/gif_modal/components/gif_item';
import type { GifResult } from 'flavours/glitch/models/gif';
import { useAppDispatch, useAppSelector } from 'flavours/glitch/store';

const messages = defineMessages({
  search: { id: 'gif_search.search', defaultMessage: 'Search for GIFs' },
  error: {
    id: 'gif_search.error',
    defaultMessage: 'Oops! Something went wrong. Please, try again.',
  },
  loading: { id: 'gif_search.loading', defaultMessage: 'Loading...' },
  nomatches: {
    id: 'gif_search.nomatches',
    defaultMessage: 'No matches found.',
  },
  close: { id: 'settings.close', defaultMessage: 'Close' },
  clear: { id: 'emoji_button.clear', defaultMessage: 'Clear' },
});

const unfocus = () => {
  document.querySelector('.ui')?.parentElement?.focus();
};

export const GIFModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const gifs = useAppSelector(
    (state) => state.compose.get('gifs') as ImmutableMap<string, unknown>,
  );
  const results = gifs.get('items') as ImmutableOrderedSet<GifResult>;
  const isLoading = gifs.get('isLoading') as boolean;
  const [value, setValue] = useState('');
  const [sendTimeout, setSendTimeout] = useState<number>();
  const [disabled, setDisabled] = useState(false);
  const hasValue = value.length > 0;

  useEffect(() => {
    clearTimeout(sendTimeout);
    void dispatch(resetGifs());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Adding sendTimeout as suggested would result in this being called every time it changes
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading) setDisabled(false);
  }, [results, isLoading]);

  const handleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setValue(value);

      if (value.length > 0) {
        clearTimeout(sendTimeout);
        setSendTimeout(
          window.setTimeout(() => {
            dispatch(gifSearch(value));
          }, 500),
        );
      } else {
        clearTimeout(sendTimeout);
      }
    },
    [dispatch, sendTimeout],
  );

  const handleClear = useCallback(() => {
    setValue('');
    void dispatch(resetGifs());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    void dispatch(resetGifs());
    onClose();
  }, [dispatch, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          unfocus();
          void dispatch(resetGifs());

          break;
        case 'Enter':
          e.preventDefault();
          clearTimeout(sendTimeout);
          setDisabled(true);
          dispatch(gifSearch(value));

          break;
      }
    },
    [dispatch, sendTimeout, value],
  );

  const handleSelect = useCallback(
    (result: GifResult) => {
      setDisabled(true);
      const url = result.url;
      const alt = result.description;
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          dispatch(uploadCompose([blob], alt));
          onClose();
          return;
        })
        .catch((e: unknown) => {
          setDisabled(false);
          dispatch(showAlertForError(e));
        });
    },
    [dispatch, onClose],
  );

  return (
    <div className='modal-root__modal gif-modal'>
      <div className='gif-modal__container'>
        <IconButton
          title={intl.formatMessage(messages.close)}
          icon='close'
          iconComponent={CloseIcon}
          onClick={handleClose}
          style={{ float: 'right' }}
        />
        <div className='gif-modal__search'>
          <input
            ref={searchInputRef}
            className='search__input'
            type='text'
            placeholder={intl.formatMessage(messages.search)}
            aria-label={intl.formatMessage(messages.search)}
            value={value}
            disabled={disabled}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <button
            type='button'
            className='emoji-mart-search-icon'
            disabled={!hasValue || disabled}
            aria-label={intl.formatMessage(messages.clear)}
            onClick={handleClear}
          >
            <Icon id='' icon={!hasValue ? SearchIcon : CancelIcon} />
          </button>
        </div>

        {isLoading ? (
          <CircularProgress size={50} strokeWidth={6} />
        ) : (
          results.size > 0 && (
            <div className='gif-modal__results account-gallery__container'>
              {results.map((gif) => (
                <GifItem
                  key={gif.id}
                  gif={gif}
                  onSelect={handleSelect}
                  disabled={disabled}
                />
              ))}
            </div>
          )
        )}
        <br />
        <img src='/tenor.svg' alt='Tenor' />
      </div>
    </div>
  );
};
