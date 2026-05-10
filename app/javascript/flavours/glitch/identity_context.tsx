import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';

import hoistStatics from 'hoist-non-react-statics';

import type { InitialState } from 'flavours/glitch/initial_state';

export interface IdentityContextType {
  signedIn: boolean;
  accountId: string | undefined;
  disabledAccountId: string | undefined;
  permissions: number;
}

export const identityContextPropShape = PropTypes.shape({
  signedIn: PropTypes.bool.isRequired,
  accountId: PropTypes.string,
  disabledAccountId: PropTypes.string,
}).isRequired;

export const createIdentityContext = (state: InitialState) => ({
  signedIn: !!state.meta.me,
  accountId: state.meta.me,
  disabledAccountId: state.meta.disabled_account_id,
  permissions: state.role?.permissions ?? 0,
});

export const IdentityContext = createContext<IdentityContextType>({
  signedIn: false,
  permissions: 0,
  accountId: undefined,
  disabledAccountId: undefined,
});

export const useIdentity = () => useContext(IdentityContext);

interface IdentityInjectedProps {
  identity: IdentityContextType;
}

type WithoutIdentity<Props> = Omit<Props, keyof IdentityInjectedProps>;

/* Injects an `identity` prop into the wrapped component to be able to use the new context in class components */
export function withIdentity<Props extends IdentityInjectedProps>(
  Component: React.ComponentType<Props>,
) {
  const displayName = `withIdentity(${Component.displayName ?? Component.name})`;
  const C = (props: WithoutIdentity<Props>) => (
    <IdentityContext.Consumer>
      {(context) => {
        const componentProps = { ...props, identity: context } as Props;

        return <Component {...componentProps} />;
      }}
    </IdentityContext.Consumer>
  );

  C.displayName = displayName;
  C.WrappedComponent = Component;

  return hoistStatics(C, Component) as React.ComponentType<WithoutIdentity<Props>>;
}
