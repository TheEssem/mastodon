import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import {
  DotsThreeIcon,
  UserIcon,
  GearIcon,
  CirclesFourIcon,
  HeartIcon,
  BookmarkSimpleIcon,
  UsersThreeIcon,
  ProhibitIcon,
  GavelIcon,
  ShieldStarIcon,
  SignOutIcon,
} from '@phosphor-icons/react';

import { openModal } from '@/flavours/glitch/actions/modal';
import { Account } from '@/flavours/glitch/components/account';
import { Avatar } from '@/flavours/glitch/components/avatar';
import { IconButton } from '@/flavours/glitch/components/button/redesign';
import { DisplayName } from '@/flavours/glitch/components/display_name';
import { useAccountHandle } from '@/flavours/glitch/components/display_name/default';
import {
  ListItemContent,
  ListItemWrapper,
} from '@/flavours/glitch/components/list_item';
import {
  Menu,
  MenuItem,
  MenuItemDivider,
  MenuItemLink,
  MenuList,
  MenuTrigger,
} from '@/flavours/glitch/components/menu';
import { useAccount } from '@/flavours/glitch/hooks/useAccount';
import { useIdentity } from '@/flavours/glitch/identity_context';
import {
  canManageReports,
  canViewAdminDashboard,
} from '@/flavours/glitch/permissions';
import { useAppDispatch } from '@/flavours/glitch/store';

import classes from './account_card_and_menu.module.scss';

export const NavigationAccountCardAndMenu: React.FC = () => {
  const { accountId } = useIdentity();

  if (!accountId) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Account
        id={accountId}
        minimal
        withBorder={false}
        withMenu={false}
        size={32}
      />
      <Menu type='navigation'>
        <MenuTrigger
          as={IconButton}
          icon={DotsThreeIcon}
          variant='ghost'
          size='sm'
        >
          <FormattedMessage
            id='tabs_bar.account_settings'
            defaultMessage='Account settings'
          />
        </MenuTrigger>
        <MenuList placement='top' offset={8}>
          <AccountMenuItems />
        </MenuList>
      </Menu>
    </div>
  );
};

export const AccountMenuItems: React.FC<{
  context?: 'default' | 'mobile';
}> = ({ context = 'default' }) => {
  const dispatch = useAppDispatch();
  const { accountId, permissions } = useIdentity();
  const account = useAccount(accountId);

  const confirmLogout = useCallback(() => {
    dispatch(openModal({ modalType: 'CONFIRM_LOG_OUT', modalProps: {} }));
  }, [dispatch]);

  if (!accountId) {
    return null;
  }

  const isManager = canManageReports(permissions);
  const isAdmin = canViewAdminDashboard(permissions);

  const accountBasePath = `/@${account?.acct}`;

  return (
    <>
      {context === 'mobile' && <ProfileMenuItem />}

      <MenuItemLink to='/profile/edit' icon={UserIcon}>
        <FormattedMessage
          id='account.edit_profile'
          defaultMessage='Edit profile'
        />
      </MenuItemLink>

      <MenuItemLink as='a' href='/settings/preferences' icon={GearIcon}>
        <FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />
      </MenuItemLink>

      <MenuItemDivider />

      <MenuItemLink
        to={`${accountBasePath}/collections`}
        icon={CirclesFourIcon}
      >
        <FormattedMessage
          id='navigation_bar.collections'
          defaultMessage='Collections'
        />
      </MenuItemLink>

      <MenuItemLink to='/favourites' icon={HeartIcon}>
        <FormattedMessage
          id='navigation_bar.liked_posts'
          defaultMessage='Liked Posts'
        />
      </MenuItemLink>

      {context === 'mobile' && (
        <MenuItemLink to='/bookmarks' icon={BookmarkSimpleIcon}>
          <FormattedMessage
            id='navigation_bar.saved_posts'
            defaultMessage='Saved Posts'
          />
        </MenuItemLink>
      )}

      <MenuItemDivider />

      <MenuItemLink as='a' href='/relationships' icon={UsersThreeIcon}>
        <FormattedMessage
          id='navigation_bar.followers_and_following'
          defaultMessage='Followers & Following'
        />
      </MenuItemLink>

      <MenuItemLink to='/blocks' icon={ProhibitIcon}>
        <FormattedMessage
          id='navigation_bar.blocked_accounts'
          defaultMessage='Blocked accounts'
        />
      </MenuItemLink>

      {(isManager || isAdmin) && (
        <>
          <MenuItemDivider />

          {isAdmin && (
            <MenuItemLink as='a' href='/admin/dashboard' icon={GavelIcon}>
              <FormattedMessage
                id='navigation_bar.administration'
                defaultMessage='Administration'
              />
            </MenuItemLink>
          )}

          {isManager && (
            <MenuItemLink as='a' href='/admin/reports' icon={ShieldStarIcon}>
              <FormattedMessage
                id='navigation_bar.moderation'
                defaultMessage='Moderation'
              />
            </MenuItemLink>
          )}
        </>
      )}

      <MenuItemDivider />

      <MenuItem onClick={confirmLogout} icon={SignOutIcon}>
        <FormattedMessage
          id='navigation_bar.sign_out'
          defaultMessage='Sign out'
        />
      </MenuItem>
    </>
  );
};

const ProfileMenuItem: React.FC = () => {
  const { accountId } = useIdentity();
  const account = useAccount(accountId);
  const handle = useAccountHandle(account);

  if (!accountId) {
    return null;
  }

  const accountBasePath = `/@${account?.acct}`;

  return (
    <MenuItemLink to={accountBasePath}>
      <ListItemWrapper
        icon={<Avatar account={account} size={40} />}
        className={classes.profileMenuItem}
      >
        <ListItemContent subtitle={handle}>
          <DisplayName variant='simple' account={account} />
        </ListItemContent>
      </ListItemWrapper>
    </MenuItemLink>
  );
};
