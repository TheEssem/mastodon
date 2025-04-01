import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { Button } from 'flavours/glitch/components/button';
import type { Account } from 'flavours/glitch/models/account';

export interface BaseConfirmationModalProps {
  onClose: () => void;
}

export const BeesModal: React.FC<{
  account: Account;
  onClose: () => void;
}> = ({ account, onClose }) => {
  const handleClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className='modal-root__modal safety-action-modal'>
      <div className='safety-action-modal__top'>
        <div className='safety-action-modal__confirmation'>
          <h1>
            🐝&nbsp;
            <FormattedMessage
              id='bees_modal.released'
              defaultMessage='Bees released on {name}'
              values={{ name: <strong>@{account.acct}</strong> }}
            />
          </h1>
          <p>
            <FormattedMessage
              id='bees_modal.no_action'
              defaultMessage='The bees have been released on {name}. No further action is required.'
              values={{ name: <strong>@{account.acct}</strong> }}
            />
          </p>
        </div>
      </div>

      <div className='safety-action-modal__bottom'>
        <div className='safety-action-modal__actions'>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- we are in a modal and thus autofocusing is justified */}
          <Button onClick={handleClick} autoFocus>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};
