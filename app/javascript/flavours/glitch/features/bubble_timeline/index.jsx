import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { connect } from 'react-redux';

import BubbleChartIcon from '@/material-icons/400-24px/bubble_chart.svg?react';
import { DismissableBanner } from 'flavours/glitch/components/dismissable_banner';
import { identityContextPropShape, withIdentity } from 'flavours/glitch/identity_context';
import { domain } from 'flavours/glitch/initial_state';

import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import { connectBubbleStream } from '../../actions/streaming';
import { expandBubbleTimeline } from '../../actions/timelines';
import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import StatusListContainer from '../ui/containers/status_list_container';

import ColumnSettingsContainer from './containers/column_settings_container';

const messages = defineMessages({
  title: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
});

const mapStateToProps = (state, { columnId }) => {
  const uuid = columnId;
  const columns = state.getIn(['settings', 'columns']);
  const index = columns.findIndex(c => c.get('uuid') === uuid);
  const onlyMedia = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyMedia']) : state.getIn(['settings', 'bubble', 'other', 'onlyMedia']);
  const regex = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'regex', 'body']) : state.getIn(['settings', 'bubble', 'regex', 'body']);
  const timelineState = state.getIn(['timelines', `bubble${onlyMedia ? ':media' : ''}`]);

  return {
    hasUnread: !!timelineState && timelineState.get('unread') > 0,
    onlyMedia,
    regex,
  };
};

class BubbleTimeline extends PureComponent {
  static defaultProps = {
    onlyMedia: false,
  };

  static propTypes = {
    identity: identityContextPropShape,
    dispatch: PropTypes.func.isRequired,
    columnId: PropTypes.string,
    intl: PropTypes.object.isRequired,
    hasUnread: PropTypes.bool,
    multiColumn: PropTypes.bool,
    onlyMedia: PropTypes.bool,
    regex: PropTypes.string,
  };

  handlePin = () => {
    const { columnId, dispatch, onlyMedia } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('BUBBLE', { other: { onlyMedia } }));
    }
  };

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  };

  handleHeaderClick = () => {
    this.column.scrollTop();
  };

  componentDidMount () {
    const { dispatch, onlyMedia } = this.props;
    const { signedIn } = this.props.identity;

    dispatch(expandBubbleTimeline({ onlyMedia }));

    if (signedIn) {
      this.disconnect = dispatch(connectBubbleStream({ onlyMedia }));
    }
  }

  componentDidUpdate (prevProps) {
    const { signedIn } = this.props.identity;

    if (prevProps.onlyMedia !== this.props.onlyMedia) {
      const { dispatch, onlyMedia } = this.props;

      if (this.disconnect) {
        this.disconnect();
      }

      dispatch(expandBubbleTimeline({ onlyMedia }));

      if (signedIn) {
        this.disconnect = dispatch(connectBubbleStream({ onlyMedia }));
      }
    }
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  setRef = c => {
    this.column = c;
  };

  handleLoadMore = maxId => {
    const { dispatch, onlyMedia } = this.props;

    dispatch(expandBubbleTimeline({ maxId, onlyMedia }));
  };

  render () {
    const { intl, hasUnread, columnId, multiColumn, onlyMedia } = this.props;
    const pinned = !!columnId;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='bubble'
          iconComponent={BubbleChartIcon}
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          <ColumnSettingsContainer columnId={columnId} />
        </ColumnHeader>

        <StatusListContainer
          prepend={<DismissableBanner id='bubble_timeline'><FormattedMessage id='dismissable_banner.bubble_timeline' defaultMessage='These are the most recent public posts from people on the fediverse whose accounts are on other servers selected by {domain}.' values={{ domain }} /></DismissableBanner>}
          trackScroll={!pinned}
          scrollKey={`bubble_timeline-${columnId}`}
          timelineId={`bubble${onlyMedia ? ':media' : ''}`}
          onLoadMore={this.handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.bubble' defaultMessage='The bubble timeline is currently empty, but something might show up here soon!' />}
          bindToDocument={!multiColumn}
          regex={this.props.regex}
        />

        <Helmet>
          <title>{intl.formatMessage(messages.title)}</title>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default withIdentity(connect(mapStateToProps)(injectIntl(BubbleTimeline)));
