import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import MoodIcon from '@/material-icons/400-24px/mood.svg?react';
import { Emoji } from 'flavours/glitch/components/emoji';
import {
  AnimateEmojiProvider,
  CustomEmojiProvider,
} from 'flavours/glitch/components/emoji/context';
import type { ExtraCustomEmojiMap } from 'flavours/glitch/features/emoji/types';
import { isUnicodeEmoji } from 'flavours/glitch/features/emoji/utils';
import type { NotificationGroupReaction } from 'flavours/glitch/models/notification_group';
import { useAppSelector } from 'flavours/glitch/store';

import type { LabelRenderer } from './notification_group_with_status';
import { NotificationGroupWithStatus } from './notification_group_with_status';

export const NotificationReaction: React.FC<{
  notification: NotificationGroupReaction;
  unread: boolean;
}> = ({ notification, unread }) => {
  const statusAccount = useAppSelector(
    (state) =>
      state.accounts.get(state.statuses.getIn([notification.statusId, 'account']) as string)
        ?.acct,
  );

  const labelRenderer = useCallback<LabelRenderer>(
    (displayedName, total, seeMoreHref) => {
      if (notification.reaction && total === 1) {
        const code = isUnicodeEmoji(notification.reaction.name)
          ? notification.reaction.name
          : `:${notification.reaction.name}:`;
        let custom: ExtraCustomEmojiMap | undefined;
        if (notification.reaction.url && notification.reaction.static_url) {
          custom = {
            [notification.reaction.name]: {
              shortcode: notification.reaction.name,
              static_url: notification.reaction.static_url,
              url: notification.reaction.url,
            },
          };
        }

        return (
          <AnimateEmojiProvider>
            <FormattedMessage
              id='notification.reaction'
              defaultMessage='{name} reacted to your post <e>with</e>'
              values={{
                name: displayedName,
                e: (chunks) =>
                  notification.reaction ? (
                    <>
                      {chunks}{' '}
                      <CustomEmojiProvider emojis={custom}>
                        <Emoji code={code} />
                      </CustomEmojiProvider>
                    </>
                  ) : (
                    ''
                  ),
              }}
            />
          </AnimateEmojiProvider>
        );
      }

      return (
        <FormattedMessage
          id='notification.reaction.name_and_others_with_link'
          defaultMessage='{name} and <a>{count, plural, one {# other} other {# others}}</a> reacted to your post'
          values={{
            name: displayedName,
            count: total - 1,
            a: (chunks) =>
              seeMoreHref ? <Link to={seeMoreHref}>{chunks}</Link> : chunks,
          }}
        />
      );
    },
    [notification.reaction],
  );

  return (
    <NotificationGroupWithStatus
      type='reaction'
      icon={MoodIcon}
      iconId='react'
      accountIds={notification.sampleAccountIds}
      statusId={notification.statusId}
      timestamp={notification.latest_page_notification_at}
      count={notification.notifications_count}
      labelRenderer={labelRenderer}
      labelSeeMoreHref={
        statusAccount ? `/@${statusAccount}/${notification.statusId}/reactions` : undefined
      }
      unread={unread}
    />
  );
};
