import { useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useParams } from 'react-router-dom';

import type { List as ImmutableList } from 'immutable';

import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Helmet } from '@unhead/react/helmet';
import { useDebouncedCallback } from 'use-debounce';

import { ColumnHeader as LegacyColumnHeader } from '@/flavours/glitch/components/column/header';
import {
  ColumnHeader,
  ColumnHeaderButton,
} from '@/flavours/glitch/components/column_header';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';
import { isRedesignEnabled } from '@/flavours/glitch/utils/environment';
import RefreshIcon from '@/material-icons/400-24px/refresh.svg?react';
import StarIcon from '@/material-icons/400-24px/star-fill.svg?react';
import {
  fetchFavourites,
  expandFavourites,
} from 'flavours/glitch/actions/interactions';
import { Account } from 'flavours/glitch/components/account';
import { Column } from 'flavours/glitch/components/column';
import { Icon } from 'flavours/glitch/components/icon';
import { LoadingIndicator } from 'flavours/glitch/components/loading_indicator';
import ScrollableList from 'flavours/glitch/components/scrollable_list';

const messages = defineMessages({
  title: { id: 'status.likes_title', defaultMessage: 'Post Likes' },
  heading: { id: 'column.favourited_by', defaultMessage: 'Favourited by' },
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
});

const Favourites: React.FC<{ multiColumn?: boolean }> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { statusId } = useParams<{ statusId?: string }>();

  const { accountIds, hasMore, isLoading } = useAppSelector((state) => ({
    accountIds: state.user_lists.getIn(['favourited_by', statusId, 'items']) as
      | ImmutableList<string>
      | undefined,
    hasMore: !!state.user_lists.getIn(['favourited_by', statusId, 'next']),
    isLoading: state.user_lists.getIn(
      ['favourited_by', statusId, 'isLoading'],
      true,
    ) as boolean,
  }));

  useEffect(() => {
    if (!accountIds) {
      dispatch(fetchFavourites(statusId));
    }
  }, [accountIds, dispatch, statusId]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchFavourites(statusId));
  }, [dispatch, statusId]);

  const handleLoadMore = useDebouncedCallback(
    () => {
      dispatch(expandFavourites(statusId));
    },
    300,
    {
      leading: true,
    },
  );

  if (!accountIds) {
    return (
      <Column>
        <LoadingIndicator />
      </Column>
    );
  }

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.favourites'
      defaultMessage='No one has favorited this post yet. When someone does, they will show up here.'
    />
  );

  return (
    <Column bindToDocument={!multiColumn}>
      {isRedesignEnabled() ? (
        <ColumnHeader
          withBackButton
          title={intl.formatMessage(messages.title)}
          extraButtons={
            <ColumnHeaderButton
              icon={ArrowClockwiseIcon}
              onClick={handleRefresh}
            >
              {intl.formatMessage(messages.refresh)}
            </ColumnHeaderButton>
          }
        />
      ) : (
        <LegacyColumnHeader
          icon='star'
          iconComponent={StarIcon}
          title={intl.formatMessage(messages.heading)}
          scrollTopOnClick
          showBackButton
          multiColumn={multiColumn}
          extraButton={
            <button
              type='button'
              className='column-header__button'
              title={intl.formatMessage(messages.refresh)}
              aria-label={intl.formatMessage(messages.refresh)}
              onClick={handleRefresh}
            >
              <Icon id='refresh' icon={RefreshIcon} />
            </button>
          }
        />
      )}

      <ScrollableList
        scrollKey='favourites'
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
      >
        {accountIds.map((id) => (
          <Account key={id} id={id} reference='status' />
        ))}
      </ScrollableList>

      <Helmet>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Favourites;
