import { FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import MoodIcon from '@/material-icons/400-24px/mood.svg?react';
import type { NotificationGroupReaction } from 'flavours/glitch/models/notification_group';
import { useAppSelector } from 'flavours/glitch/store';

import type { LabelRenderer } from './notification_group_with_status';
import { NotificationGroupWithStatus } from './notification_group_with_status';

const labelRenderer: LabelRenderer = (displayedName, total, seeMoreHref) => {
  if (total === 1)
    return (
      <FormattedMessage
        id='notification.reaction'
        defaultMessage='{name} reacted to your status'
        values={{ name: displayedName }}
      />
    );

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
};

export const NotificationReaction: React.FC<{
  notification: NotificationGroupReaction;
  unread: boolean;
}> = ({ notification, unread }) => {
  const { statusId } = notification;
  const statusAccount = useAppSelector(
    (state) =>
      state.accounts.get(state.statuses.getIn([statusId, 'account']) as string)
        ?.acct,
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
        statusAccount ? `/@${statusAccount}/${statusId}/reactions` : undefined
      }
      unread={unread}
    />
  );
};
