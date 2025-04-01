import { openModal } from './modal';

export const initBees = (account) => dispatch =>
  dispatch(openModal({
    modalType: 'BEES',
    modalProps: { account },
  }));
