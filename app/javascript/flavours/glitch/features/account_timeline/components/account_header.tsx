import { useCallback, useMemo } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { NavLink } from 'react-router-dom';

import { AccountBio } from '@/flavours/glitch/components/account_bio';
import CheckIcon from '@/material-icons/400-24px/check.svg?react';
import LockIcon from '@/material-icons/400-24px/lock.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import NotificationsIcon from '@/material-icons/400-24px/notifications.svg?react';
import NotificationsActiveIcon from '@/material-icons/400-24px/notifications_active-fill.svg?react';
import ShareIcon from '@/material-icons/400-24px/share.svg?react';
import {
  followAccount,
  unblockAccount,
  unmuteAccount,
  pinAccount,
  unpinAccount,
  removeAccountFromFollowers,
} from 'flavours/glitch/actions/accounts';
import { initBlockModal } from 'flavours/glitch/actions/blocks';
import { mentionCompose, directCompose } from 'flavours/glitch/actions/compose';
import {
  initDomainBlockModal,
  unblockDomain,
} from 'flavours/glitch/actions/domain_blocks';
import { openModal } from 'flavours/glitch/actions/modal';
import { initMuteModal } from 'flavours/glitch/actions/mutes';
import { initReport } from 'flavours/glitch/actions/reports';
import { Avatar } from 'flavours/glitch/components/avatar';
import {
  Badge,
  AutomatedBadge,
  GroupBadge,
} from 'flavours/glitch/components/badge';
import { Button } from 'flavours/glitch/components/button';
import { CopyIconButton } from 'flavours/glitch/components/copy_icon_button';
import { Dropdown } from 'flavours/glitch/components/dropdown_menu';
import { FollowButton } from 'flavours/glitch/components/follow_button';
import { FormattedDateWrapper } from 'flavours/glitch/components/formatted_date';
import { Icon } from 'flavours/glitch/components/icon';
import { IconButton } from 'flavours/glitch/components/icon_button';
import { AccountNote } from 'flavours/glitch/features/account/components/account_note';
import { DomainPill } from 'flavours/glitch/features/account/components/domain_pill';
import FollowRequestNoteContainer from 'flavours/glitch/features/account/containers/follow_request_note_container';
import { useLinks } from 'flavours/glitch/hooks/useLinks';
import { useIdentity } from 'flavours/glitch/identity_context';
import {
  autoPlayGif,
  me,
  domain as localDomain,
} from 'flavours/glitch/initial_state';
import type { Account } from 'flavours/glitch/models/account';
import type { MenuItem } from 'flavours/glitch/models/dropdown_menu';
import {
  PERMISSION_MANAGE_USERS,
  PERMISSION_MANAGE_FEDERATION,
} from 'flavours/glitch/permissions';
import { getAccountHidden } from 'flavours/glitch/selectors/accounts';
import { useAppSelector, useAppDispatch } from 'flavours/glitch/store';

import { ActionBar } from '../../account/components/action_bar';

import { FamiliarFollowers } from './familiar_followers';
import { MemorialNote } from './memorial_note';
import { MovedNote } from './moved_note';

const messages = defineMessages({
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  linkVerifiedOn: {
    id: 'account.link_verified_on',
    defaultMessage: 'Ownership of this link was checked on {date}',
  },
  account_locked: {
    id: 'account.locked_info',
    defaultMessage:
      'This account privacy status is set to locked. The owner manually reviews who can follow them.',
  },
  mention: { id: 'account.mention', defaultMessage: 'Mention @{name}' },
  direct: { id: 'account.direct', defaultMessage: 'Privately mention @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  share: { id: 'account.share', defaultMessage: "Share @{name}'s profile" },
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: {
    id: 'account.block_domain',
    defaultMessage: 'Block domain {domain}',
  },
  unblockDomain: {
    id: 'account.unblock_domain',
    defaultMessage: 'Unblock domain {domain}',
  },
  hideReblogs: {
    id: 'account.hide_reblogs',
    defaultMessage: 'Hide boosts from @{name}',
  },
  showReblogs: {
    id: 'account.show_reblogs',
    defaultMessage: 'Show boosts from @{name}',
  },
  enableNotifications: {
    id: 'account.enable_notifications',
    defaultMessage: 'Notify me when @{name} posts',
  },
  disableNotifications: {
    id: 'account.disable_notifications',
    defaultMessage: 'Stop notifying me when @{name} posts',
  },
  preferences: {
    id: 'navigation_bar.preferences',
    defaultMessage: 'Preferences',
  },
  follow_requests: {
    id: 'navigation_bar.follow_requests',
    defaultMessage: 'Follow requests',
  },
  favourites: { id: 'navigation_bar.favourites', defaultMessage: 'Favorites' },
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  followed_tags: {
    id: 'navigation_bar.followed_tags',
    defaultMessage: 'Followed hashtags',
  },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  domain_blocks: {
    id: 'navigation_bar.domain_blocks',
    defaultMessage: 'Blocked domains',
  },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: {
    id: 'account.unendorse',
    defaultMessage: "Don't feature on profile",
  },
  add_or_remove_from_list: {
    id: 'account.add_or_remove_from_list',
    defaultMessage: 'Add or Remove from lists',
  },
  admin_account: {
    id: 'status.admin_account',
    defaultMessage: 'Open moderation interface for @{name}',
  },
  admin_domain: {
    id: 'status.admin_domain',
    defaultMessage: 'Open moderation interface for {domain}',
  },
  languages: {
    id: 'account.languages',
    defaultMessage: 'Change subscribed languages',
  },
  openOriginalPage: {
    id: 'account.open_original_page',
    defaultMessage: 'Open original page',
  },
  removeFromFollowers: {
    id: 'account.remove_from_followers',
    defaultMessage: 'Remove {name} from followers',
  },
  confirmRemoveFromFollowersTitle: {
    id: 'confirmations.remove_from_followers.title',
    defaultMessage: 'Remove follower?',
  },
  confirmRemoveFromFollowersMessage: {
    id: 'confirmations.remove_from_followers.message',
    defaultMessage:
      '{name} will stop following you. Are you sure you want to proceed?',
  },
  confirmRemoveFromFollowersButton: {
    id: 'confirmations.remove_from_followers.confirm',
    defaultMessage: 'Remove follower',
  },
});

const titleFromAccount = (account: Account) => {
  const displayName = account.display_name;
  const acct =
    account.acct === account.username
      ? `${account.username}@${localDomain}`
      : account.acct;
  const prefix =
    displayName.trim().length === 0 ? account.username : displayName;

  return `${prefix} (@${acct})`;
};

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export const AccountHeader: React.FC<{
  accountId: string;
  hideTabs?: boolean;
}> = ({ accountId, hideTabs }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { signedIn, permissions } = useIdentity();
  const account = useAppSelector((state) => state.accounts.get(accountId));
  const relationship = useAppSelector((state) =>
    state.relationships.get(accountId),
  );
  const hidden = useAppSelector((state) => getAccountHidden(state, accountId));
  const handleLinkClick = useLinks();

  const handleBlock = useCallback(() => {
    if (!account) {
      return;
    }

    if (relationship?.blocking) {
      dispatch(unblockAccount(account.id));
    } else {
      dispatch(initBlockModal(account));
    }
  }, [dispatch, account, relationship]);

  const handleMention = useCallback(() => {
    if (!account) {
      return;
    }

    dispatch(mentionCompose(account));
  }, [dispatch, account]);

  const handleDirect = useCallback(() => {
    if (!account) {
      return;
    }

    dispatch(directCompose(account));
  }, [dispatch, account]);

  const handleReport = useCallback(() => {
    if (!account) {
      return;
    }

    dispatch(initReport(account));
  }, [dispatch, account]);

  const handleReblogToggle = useCallback(() => {
    if (!account) {
      return;
    }

    if (relationship?.showing_reblogs) {
      dispatch(followAccount(account.id, { reblogs: false }));
    } else {
      dispatch(followAccount(account.id, { reblogs: true }));
    }
  }, [dispatch, account, relationship]);

  const handleNotifyToggle = useCallback(() => {
    if (!account) {
      return;
    }

    if (relationship?.notifying) {
      dispatch(followAccount(account.id, { notify: false }));
    } else {
      dispatch(followAccount(account.id, { notify: true }));
    }
  }, [dispatch, account, relationship]);

  const handleMute = useCallback(() => {
    if (!account) {
      return;
    }

    if (relationship?.muting) {
      dispatch(unmuteAccount(account.id));
    } else {
      dispatch(initMuteModal(account));
    }
  }, [dispatch, account, relationship]);

  const handleBlockDomain = useCallback(() => {
    if (!account) {
      return;
    }

    dispatch(initDomainBlockModal(account));
  }, [dispatch, account]);

  const handleUnblockDomain = useCallback(() => {
    if (!account) {
      return;
    }

    const domain = account.acct.split('@')[1];

    if (!domain) {
      return;
    }

    dispatch(unblockDomain(domain));
  }, [dispatch, account]);

  const handleEndorseToggle = useCallback(() => {
    if (!account) {
      return;
    }

    if (relationship?.endorsed) {
      dispatch(unpinAccount(account.id));
    } else {
      dispatch(pinAccount(account.id));
    }
  }, [dispatch, account, relationship]);

  const handleAddToList = useCallback(() => {
    if (!account) {
      return;
    }

    dispatch(
      openModal({
        modalType: 'LIST_ADDER',
        modalProps: {
          accountId: account.id,
        },
      }),
    );
  }, [dispatch, account]);

  const handleChangeLanguages = useCallback(() => {
    if (!account) {
      return;
    }

    dispatch(
      openModal({
        modalType: 'SUBSCRIBED_LANGUAGES',
        modalProps: {
          accountId: account.id,
        },
      }),
    );
  }, [dispatch, account]);

  const handleOpenAvatar = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey) {
        return;
      }

      e.preventDefault();

      if (!account) {
        return;
      }

      dispatch(
        openModal({
          modalType: 'IMAGE',
          modalProps: {
            src: account.avatar,
            alt: account.avatar_description,
          },
        }),
      );
    },
    [dispatch, account],
  );

  const handleShare = useCallback(() => {
    if (!account) {
      return;
    }

    void navigator.share({
      url: account.url,
    });
  }, [account]);

  const handleMouseEnter = useCallback(
    ({ currentTarget }: React.MouseEvent) => {
      if (autoPlayGif) {
        return;
      }

      currentTarget
        .querySelectorAll<HTMLImageElement>('.custom-emoji')
        .forEach((emoji) => {
          emoji.src = emoji.getAttribute('data-original') ?? '';
        });
    },
    [],
  );

  const handleMouseLeave = useCallback(
    ({ currentTarget }: React.MouseEvent) => {
      if (autoPlayGif) {
        return;
      }

      currentTarget
        .querySelectorAll<HTMLImageElement>('.custom-emoji')
        .forEach((emoji) => {
          emoji.src = emoji.getAttribute('data-static') ?? '';
        });
    },
    [],
  );

  const suspended = account?.suspended;
  const isRemote = account?.acct !== account?.username;
  const remoteDomain = isRemote ? account?.acct.split('@')[1] : null;

  const menu = useMemo(() => {
    const arr: MenuItem[] = [];

    if (!account) {
      return arr;
    }

    if (signedIn && !account.suspended) {
      arr.push({
        text: intl.formatMessage(messages.mention, {
          name: account.username,
        }),
        action: handleMention,
      });
      arr.push({
        text: intl.formatMessage(messages.direct, {
          name: account.username,
        }),
        action: handleDirect,
      });
      arr.push(null);
    }

    if (isRemote) {
      arr.push({
        text: intl.formatMessage(messages.openOriginalPage),
        href: account.url,
      });
      arr.push(null);
    }

    if (signedIn) {
      if (relationship?.following) {
        if (!relationship.muting) {
          if (relationship.showing_reblogs) {
            arr.push({
              text: intl.formatMessage(messages.hideReblogs, {
                name: account.username,
              }),
              action: handleReblogToggle,
            });
          } else {
            arr.push({
              text: intl.formatMessage(messages.showReblogs, {
                name: account.username,
              }),
              action: handleReblogToggle,
            });
          }

          arr.push({
            text: intl.formatMessage(messages.languages),
            action: handleChangeLanguages,
          });
          arr.push(null);
        }

        arr.push({
          text: intl.formatMessage(
            relationship.endorsed ? messages.unendorse : messages.endorse,
          ),
          action: handleEndorseToggle,
        });
        arr.push({
          text: intl.formatMessage(messages.add_or_remove_from_list),
          action: handleAddToList,
        });
        arr.push(null);
      }

      if (relationship?.followed_by) {
        const handleRemoveFromFollowers = () => {
          dispatch(
            openModal({
              modalType: 'CONFIRM',
              modalProps: {
                title: intl.formatMessage(
                  messages.confirmRemoveFromFollowersTitle,
                ),
                message: intl.formatMessage(
                  messages.confirmRemoveFromFollowersMessage,
                  { name: <strong>{account.acct}</strong> },
                ),
                confirm: intl.formatMessage(
                  messages.confirmRemoveFromFollowersButton,
                ),
                onConfirm: () => {
                  void dispatch(removeAccountFromFollowers({ accountId }));
                },
              },
            }),
          );
        };

        arr.push({
          text: intl.formatMessage(messages.removeFromFollowers, {
            name: account.username,
          }),
          action: handleRemoveFromFollowers,
          dangerous: true,
        });
      }

      if (relationship?.muting) {
        arr.push({
          text: intl.formatMessage(messages.unmute, {
            name: account.username,
          }),
          action: handleMute,
        });
      } else {
        arr.push({
          text: intl.formatMessage(messages.mute, {
            name: account.username,
          }),
          action: handleMute,
          dangerous: true,
        });
      }

      if (relationship?.blocking) {
        arr.push({
          text: intl.formatMessage(messages.unblock, {
            name: account.username,
          }),
          action: handleBlock,
        });
      } else {
        arr.push({
          text: intl.formatMessage(messages.block, {
            name: account.username,
          }),
          action: handleBlock,
          dangerous: true,
        });
      }

      if (!account.suspended) {
        arr.push({
          text: intl.formatMessage(messages.report, {
            name: account.username,
          }),
          action: handleReport,
          dangerous: true,
        });
      }
    }

    if (signedIn && isRemote) {
      arr.push(null);

      if (relationship?.domain_blocking) {
        arr.push({
          text: intl.formatMessage(messages.unblockDomain, {
            domain: remoteDomain,
          }),
          action: handleUnblockDomain,
        });
      } else {
        arr.push({
          text: intl.formatMessage(messages.blockDomain, {
            domain: remoteDomain,
          }),
          action: handleBlockDomain,
          dangerous: true,
        });
      }
    }

    if (
      (permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS ||
      (isRemote &&
        (permissions & PERMISSION_MANAGE_FEDERATION) ===
          PERMISSION_MANAGE_FEDERATION)
    ) {
      arr.push(null);
      if ((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS) {
        arr.push({
          text: intl.formatMessage(messages.admin_account, {
            name: account.username,
          }),
          href: `/admin/accounts/${account.id}`,
        });
      }
      if (
        isRemote &&
        (permissions & PERMISSION_MANAGE_FEDERATION) ===
          PERMISSION_MANAGE_FEDERATION
      ) {
        arr.push({
          text: intl.formatMessage(messages.admin_domain, {
            domain: remoteDomain,
          }),
          href: `/admin/instances/${remoteDomain}`,
        });
      }
    }

    return arr;
  }, [
    dispatch,
    accountId,
    account,
    relationship,
    permissions,
    isRemote,
    remoteDomain,
    intl,
    signedIn,
    handleAddToList,
    handleBlock,
    handleBlockDomain,
    handleChangeLanguages,
    handleDirect,
    handleEndorseToggle,
    handleMention,
    handleMute,
    handleReblogToggle,
    handleReport,
    handleUnblockDomain,
  ]);

  if (!account) {
    return null;
  }

  let actionBtn: React.ReactNode,
    bellBtn: React.ReactNode,
    lockedIcon: React.ReactNode,
    shareBtn: React.ReactNode;

  const info: React.ReactNode[] = [];

  if (me !== account.id && relationship) {
    if (
      relationship.followed_by &&
      (relationship.following || relationship.requested)
    ) {
      info.push(
        <span key='mutual' className='relationship-tag'>
          <FormattedMessage
            id='account.mutual'
            defaultMessage='You follow each other'
          />
        </span>,
      );
    } else if (relationship.followed_by) {
      info.push(
        <span key='followed_by' className='relationship-tag'>
          <FormattedMessage
            id='account.follows_you'
            defaultMessage='Follows you'
          />
        </span>,
      );
    } else if (relationship.requested_by) {
      info.push(
        <span key='requested_by' className='relationship-tag'>
          <FormattedMessage
            id='account.requests_to_follow_you'
            defaultMessage='Requests to follow you'
          />
        </span>,
      );
    }

    if (relationship.blocking) {
      info.push(
        <span key='blocking' className='relationship-tag'>
          <FormattedMessage id='account.blocking' defaultMessage='Blocking' />
        </span>,
      );
    }

    if (relationship.muting) {
      info.push(
        <span key='muting' className='relationship-tag'>
          <FormattedMessage id='account.muting' defaultMessage='Muting' />
        </span>,
      );
    }

    if (relationship.domain_blocking) {
      info.push(
        <span key='domain_blocking' className='relationship-tag'>
          <FormattedMessage
            id='account.domain_blocking'
            defaultMessage='Blocking domain'
          />
        </span>,
      );
    }
  }

  if (relationship?.requested || relationship?.following) {
    bellBtn = (
      <IconButton
        icon={relationship.notifying ? 'bell' : 'bell-o'}
        iconComponent={
          relationship.notifying ? NotificationsActiveIcon : NotificationsIcon
        }
        active={relationship.notifying}
        title={intl.formatMessage(
          relationship.notifying
            ? messages.disableNotifications
            : messages.enableNotifications,
          { name: account.username },
        )}
        onClick={handleNotifyToggle}
      />
    );
  }

  if ('share' in navigator) {
    shareBtn = (
      <IconButton
        className='optional'
        icon=''
        iconComponent={ShareIcon}
        title={intl.formatMessage(messages.share, {
          name: account.username,
        })}
        onClick={handleShare}
      />
    );
  } else {
    shareBtn = (
      <CopyIconButton
        className='optional'
        title={intl.formatMessage(messages.copy)}
        value={account.url}
      />
    );
  }

  if (relationship?.blocking) {
    actionBtn = (
      <Button
        text={intl.formatMessage(messages.unblock, {
          name: account.username,
        })}
        onClick={handleBlock}
      />
    );
  } else {
    actionBtn = <FollowButton accountId={accountId} />;
  }

  if (account.moved && !relationship?.following) {
    actionBtn = '';
  }

  if (account.locked) {
    lockedIcon = (
      <Icon
        id='lock'
        icon={LockIcon}
        aria-label={intl.formatMessage(messages.account_locked)}
      />
    );
  }

  const displayNameHtml = { __html: account.display_name_html };
  const fields = account.fields;
  const isLocal = !account.acct.includes('@');
  const username = account.acct.split('@')[0];
  const domain = isLocal ? localDomain : account.acct.split('@')[1];
  const isIndexable = !account.noindex;

  const badges = [];

  if (account.bot) {
    badges.push(<AutomatedBadge key='bot-badge' />);
  } else if (account.group) {
    badges.push(<GroupBadge key='group-badge' />);
  }

  account.roles.forEach((role) => {
    badges.push(
      <Badge
        key={`role-badge-${role.get('id')}`}
        label={<span>{role.get('name')}</span>}
        domain={domain}
        roleId={role.get('id')}
      />,
    );
  });

  return (
    <div className='account-timeline__header'>
      {!hidden && account.memorial && <MemorialNote />}
      {!hidden && account.moved && (
        <MovedNote accountId={account.id} targetAccountId={account.moved} />
      )}

      <div
        className={classNames('account__header', {
          inactive: !!account.moved,
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!(suspended || hidden || account.moved) &&
          relationship?.requested_by && (
            <FollowRequestNoteContainer account={account} />
          )}

        <div className='account__header__image'>
          <div className='account__header__info'>{info}</div>

          {!(suspended || hidden) && (
            <img
              src={autoPlayGif ? account.header : account.header_static}
              alt={account.header_description}
              title={account.header_description}
              className='parallax'
            />
          )}
        </div>

        <div className='account__header__bar'>
          <div className='account__header__tabs'>
            <a
              className='avatar'
              href={account.avatar}
              rel='noopener'
              target='_blank'
              onClick={handleOpenAvatar}
            >
              <Avatar
                account={suspended || hidden ? undefined : account}
                size={92}
              />
            </a>

            <div className='account__header__tabs__buttons'>
              {!hidden && bellBtn}
              {!hidden && shareBtn}
              {accountId !== me && (
                <Dropdown
                  disabled={menu.length === 0}
                  items={menu}
                  icon='ellipsis-v'
                  iconComponent={MoreHorizIcon}
                />
              )}
              {!hidden && actionBtn}
            </div>
          </div>

          <div className='account__header__tabs__name'>
            <h1>
              <span dangerouslySetInnerHTML={displayNameHtml} />
              <small>
                <span>
                  @{username}
                  <span className='invisible'>@{domain}</span>
                </span>
                <DomainPill
                  username={username ?? ''}
                  domain={domain ?? ''}
                  isSelf={me === account.id}
                />
                {lockedIcon}
              </small>
            </h1>
          </div>

          {badges.length > 0 && (
            <div className='account__header__badges'>{badges}</div>
          )}

          {account.id !== me && signedIn && !(suspended || hidden) && (
            <FamiliarFollowers accountId={accountId} />
          )}

          {!(suspended || hidden) && (
            <div className='account__header__extra'>
              <div
                className='account__header__bio'
                onClickCapture={handleLinkClick}
              >
                {account.id !== me && signedIn && (
                  <AccountNote accountId={accountId} />
                )}

                <AccountBio
                  accountId={accountId}
                  className='account__header__content'
                />

                <div className='account__header__fields'>
                  <dl>
                    <dt>
                      <FormattedMessage
                        id='account.joined_short'
                        defaultMessage='Joined'
                      />
                    </dt>
                    <dd>
                      <FormattedDateWrapper
                        value={account.created_at}
                        year='numeric'
                        month='short'
                        day='2-digit'
                      />
                    </dd>
                  </dl>

                  {fields.map((pair, i) => (
                    <dl
                      key={i}
                      className={classNames({
                        verified: pair.verified_at,
                      })}
                    >
                      <dt
                        dangerouslySetInnerHTML={{
                          __html: pair.name_emojified,
                        }}
                        title={pair.name}
                        className='translate'
                      />

                      <dd className='translate' title={pair.value_plain ?? ''}>
                        {pair.verified_at && (
                          <span
                            title={intl.formatMessage(messages.linkVerifiedOn, {
                              date: intl.formatDate(
                                pair.verified_at,
                                dateFormatOptions,
                              ),
                            })}
                          >
                            <Icon
                              id='check'
                              icon={CheckIcon}
                              className='verified__mark'
                            />
                          </span>
                        )}{' '}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: pair.value_emojified,
                          }}
                        />
                      </dd>
                    </dl>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ActionBar account={account} />

      {!(hideTabs || hidden) && (
        <div className='account__section-headline'>
          <NavLink exact to={`/@${account.acct}/featured`}>
            <FormattedMessage id='account.featured' defaultMessage='Featured' />
          </NavLink>
          <NavLink exact to={`/@${account.acct}`}>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </NavLink>
          <NavLink exact to={`/@${account.acct}/with_replies`}>
            <FormattedMessage
              id='account.posts_with_replies'
              defaultMessage='Posts and replies'
            />
          </NavLink>
          <NavLink exact to={`/@${account.acct}/media`}>
            <FormattedMessage id='account.media' defaultMessage='Media' />
          </NavLink>
        </div>
      )}

      <Helmet>
        <title>{titleFromAccount(account)}</title>
        <meta
          name='robots'
          content={isLocal && isIndexable ? 'all' : 'noindex'}
        />
        <link rel='canonical' href={account.url} />
      </Helmet>
    </div>
  );
};
