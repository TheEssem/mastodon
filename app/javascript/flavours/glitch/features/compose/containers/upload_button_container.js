import { connect } from 'react-redux';

import { uploadCompose } from '../../../actions/compose';
import { openModal, closeModal } from '../../../actions/modal';
import UploadButton from '../components/upload_button';

const mapStateToProps = state => {
  const isUploading = state.getIn(['compose', 'is_uploading']);
  const readyAttachmentsSize = state.getIn(['compose', 'media_attachments']).size ?? 0;
  const pendingAttachmentsSize = state.getIn(['compose', 'pending_media_attachments']).size ?? 0;
  const attachmentsSize = readyAttachmentsSize + pendingAttachmentsSize;
  const isOverLimit = attachmentsSize > state.getIn(['server', 'server', 'configuration', 'statuses', 'max_media_attachments'])-1;
  const hasVideoOrAudio = state.getIn(['compose', 'media_attachments']).some(m => ['video', 'audio'].includes(m.get('type')));

  return {
    disabled: isUploading || isOverLimit || hasVideoOrAudio,
    resetFileKey: state.getIn(['compose', 'resetFileKey']),
  };
};

const mapDispatchToProps = dispatch => ({

  onSelectFile(files) {
    dispatch(uploadCompose(files));
  },

  onDoodleOpen() {
    dispatch(openModal({
      modalType: 'DOODLE',
      modalProps: { noEsc: true, noClose: true },
    }));
  },

  onEmbedGif() {
    dispatch(openModal({
      modalType: 'GIF',
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
