import { useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useParams } from 'react-router-dom';

import type { OrderedSet as ImmutableOrderedSet } from 'immutable';

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
import MoodIcon from '@/material-icons/400-24px/mood.svg?react';
import RefreshIcon from '@/material-icons/400-24px/refresh.svg?react';
import {
  fetchReactions,
  expandReactions,
} from 'flavours/glitch/actions/interactions';
import { Account } from 'flavours/glitch/components/account';
import { Column } from 'flavours/glitch/components/column';
import { Icon } from 'flavours/glitch/components/icon';
import { LoadingIndicator } from 'flavours/glitch/components/loading_indicator';
import ScrollableList from 'flavours/glitch/components/scrollable_list';
import type { StatusReaction } from 'flavours/glitch/models/reaction';

const messages = defineMessages({
  title: { id: 'status.reactions_title', defaultMessage: 'Post Reactions' },
  heading: { id: 'column.reacted_by', defaultMessage: 'Reacted by' },
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
});

const Reactions: React.FC<{ multiColumn?: boolean }> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { statusId } = useParams<{ statusId?: string }>();

  const { reactions, hasMore, isLoading } = useAppSelector((state) => ({
    reactions: state.status_reactions.getIn([
      'reactions',
      statusId,
      'items',
    ]) as ImmutableOrderedSet<StatusReaction> | undefined,
    hasMore: !!state.status_reactions.getIn(['reactions', statusId, 'next']),
    isLoading: state.status_reactions.getIn(
      ['reactions', statusId, 'isLoading'],
      true,
    ) as boolean,
  }));

  useEffect(() => {
    if (!reactions) {
      dispatch(fetchReactions(statusId));
    }
  }, [reactions, dispatch, statusId]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchReactions(statusId));
  }, [dispatch, statusId]);

  const handleLoadMore = useDebouncedCallback(
    () => {
      dispatch(expandReactions(statusId));
    },
    300,
    {
      leading: true,
    },
  );

  if (!reactions) {
    return (
      <Column>
        <LoadingIndicator />
      </Column>
    );
  }

  const emptyMessage = (
    <FormattedMessage
      id='status.reactions.empty'
      defaultMessage='No one has reacted to this post yet. When someone does, they will show up here.'
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
          icon='mood'
          iconComponent={MoodIcon}
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
        scrollKey='reactions'
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
      >
        {reactions.map((r) => (
          <Account
            key={r.id}
            id={r.account}
            reference='status'
            overlayEmoji={r}
          />
        ))}
      </ScrollableList>

      <Helmet>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Reactions;
