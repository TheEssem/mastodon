import { useCallback, useMemo, useRef } from 'react';
import type { FC, ReactNode } from 'react';

import { Account } from '@/flavours/glitch/components/account';
import type { ColumnRef } from '@/flavours/glitch/components/column';
import { Column } from '@/flavours/glitch/components/column';
import { LoadingIndicator } from '@/flavours/glitch/components/loading_indicator';
import ScrollableList from '@/flavours/glitch/components/scrollable_list';
import BundleColumnError from '@/flavours/glitch/features/ui/components/bundle_column_error';
import { useAccount } from '@/flavours/glitch/hooks/useAccount';
import { useAccountVisibility } from '@/flavours/glitch/hooks/useAccountVisibility';
import { useLayout } from '@/flavours/glitch/hooks/useLayout';

import { ProfileColumnHeader } from '../../account/components/profile_column_header';
import { AccountHeader } from '../../account_timeline/components/account_header';

import { RemoteHint } from './remote';

export interface AccountList {
  hasMore: boolean;
  isLoading: boolean;
  items: string[];
}

interface AccountListProps {
  accountId?: string | null;
  append?: ReactNode;
  emptyMessage: ReactNode;
  footer?: ReactNode;
  list?: AccountList | null;
  loadMore: () => void;
  prependAccountId?: string | null;
  scrollKey: string;
}

export const AccountList: FC<AccountListProps> = ({
  accountId,
  append,
  emptyMessage,
  footer,
  list,
  loadMore,
  prependAccountId,
  scrollKey,
}) => {
  const account = useAccount(accountId);

  const { blockedBy, hidden, suspended } = useAccountVisibility(accountId);
  const forceEmptyState = blockedBy || hidden || suspended;

  const children = useMemo(() => {
    if (forceEmptyState) {
      return [];
    }
    const children =
      list?.items.map((followerId) => (
        <Account key={followerId} id={followerId} />
      )) ?? [];

    if (prependAccountId) {
      children.unshift(
        <Account key={prependAccountId} id={prependAccountId} minimal />,
      );
    }
    return children;
  }, [prependAccountId, list, forceEmptyState]);

  const columnRef = useRef<ColumnRef>(null);
  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const { multiColumn } = useLayout();

  // Null means accountId does not exist (e.g. invalid acct). Undefined means loading.
  if (accountId === null) {
    return <BundleColumnError multiColumn={multiColumn} errorType='routing' />;
  }

  if (!accountId || !account) {
    return (
      <Column bindToDocument={!multiColumn}>
        <LoadingIndicator />
      </Column>
    );
  }

  const domain = account.acct.split('@')[1];

  return (
    <Column ref={columnRef}>
      <ProfileColumnHeader
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      <ScrollableList
        scrollKey={scrollKey}
        hasMore={!forceEmptyState && list?.hasMore}
        isLoading={list?.isLoading ?? true}
        onLoadMore={loadMore}
        prepend={<AccountHeader accountId={accountId} hideTabs />}
        alwaysPrepend
        append={append ?? <RemoteHint domain={domain} url={account.url} />}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        footer={footer}
      >
        {children}
      </ScrollableList>
    </Column>
  );
};
