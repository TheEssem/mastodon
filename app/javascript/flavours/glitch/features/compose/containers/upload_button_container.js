import { connect } from 'react-redux';

import { uploadCompose } from '../../../actions/compose';
import { openModal, closeModal } from '../../../actions/modal';
import UploadButton from '../components/upload_button';

const mapStateToProps = state => ({
  disabled: state.getIn(['compose', 'poll']) !== null || state.getIn(['compose', 'is_uploading']) || (state.getIn(['compose', 'media_attachments']).size + state.getIn(['compose', 'pending_media_attachments']) > 3 || state.getIn(['compose', 'media_attachments']).some(m => ['video', 'audio'].includes(m.get('type')))),
  resetFileKey: state.getIn(['compose', 'resetFileKey']),
});

const mapDispatchToProps = dispatch => ({

  onSelectFile (files) {
    dispatch(uploadCompose(files));
  },

  onDoodleOpen() {
    dispatch(openModal({
      modalType: 'DOODLE',
      modalProps: { noEsc: true, noClose: true },
    }));
  },

  onEmbedTenor() {
    dispatch(openModal({
      modalType: 'TENOR',
      modalProps: { noEsc: true },
    }));
  },

  onModalClose() {
    dispatch(closeModal({
      modalType: undefined,
      ignoreFocus: false,
    }));
  },

  onModalOpen(props) {
    dispatch(openModal({ modalType: 'ACTIONS', modalProps: props }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);
