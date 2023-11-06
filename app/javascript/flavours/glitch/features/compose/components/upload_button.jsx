import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import GifBoxIcon from '@/material-icons/400-24px/gif_box.svg?react';
import PhotoLibraryIcon from '@/material-icons/400-20px/photo_library.svg?react';
import BrushIcon from '@/material-icons/400-24px/brush.svg?react';
import UploadFileIcon from '@/material-icons/400-24px/upload_file.svg?react';

import { DropdownIconButton } from './dropdown_icon_button';

const messages = defineMessages({
  upload: { id: 'upload_button.label', defaultMessage: 'Add images, a video or an audio file' },
  doodle: { id: 'compose.attach.doodle', defaultMessage: 'Draw something' },
  gif:    { id: 'compose.attach.gif', defaultMessage: 'Upload GIF' },
});

const makeMapStateToProps = () => {
  const mapStateToProps = state => ({
    acceptContentTypes: state.getIn(['media_attachments', 'accept_content_types']),
  });

  return mapStateToProps;
};

class UploadButton extends ImmutablePureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    onSelectFile: PropTypes.func.isRequired,
    onDoodleOpen: PropTypes.func.isRequired,
    onEmbedTenor: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    onModalOpen: PropTypes.func.isRequired,
    style: PropTypes.object,
    resetFileKey: PropTypes.number,
    acceptContentTypes: ImmutablePropTypes.listOf(PropTypes.string).isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleChange = (e) => {
    if (e.target.files.length > 0) {
      this.props.onSelectFile(e.target.files);
    }
  };

  handleSelect = (value) => {
    if (value === 'upload') {
      this.fileElement.click();
    } else if (value === 'doodle') {
      this.props.onDoodleOpen();
    } else if (value === 'gif') {
      this.props.onEmbedTenor();
    }
  };

  setRef = (c) => {
    this.fileElement = c;
  };

  render () {
    const { intl, resetFileKey, disabled, acceptContentTypes } = this.props;

    const message = intl.formatMessage(messages.upload);

    const options = [
      {
        icon: 'cloud-upload',
        iconComponent: UploadFileIcon,
        value: 'upload',
        text: intl.formatMessage(messages.upload),
      },
      {
        icon: 'paint-brush',
        iconComponent: BrushIcon,
        value: 'doodle',
        text: intl.formatMessage(messages.doodle),
      },
      {
        icon: 'gif-box',
        iconComponent: GifBoxIcon,
        value: 'gif',
        text: intl.formatMessage(messages.gif),
      },
    ];

    return (
      <div className='compose-form__upload-button'>
        <DropdownIconButton
          icon='paperclip'
          iconComponent={PhotoLibraryIcon}
          title={message}
          disabled={disabled}
          onChange={this.handleSelect}
          value='upload'
          options={options}
        />
        <label>
          <span style={{ display: 'none' }}>{message}</span>
          <input
            key={resetFileKey}
            ref={this.setRef}
            type='file'
            name='file-upload-input'
            multiple
            accept={acceptContentTypes.toArray().join(',')}
            onChange={this.handleChange}
            disabled={disabled}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    );
  }

}

export default connect(makeMapStateToProps)(injectIntl(UploadButton));
