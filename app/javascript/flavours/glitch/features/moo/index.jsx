import { FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import ImmutablePureComponent from 'react-immutable-pure-component';

import Column from 'flavours/glitch/components/column';
import { GIF } from 'flavours/glitch/components/gif';

class Moo extends ImmutablePureComponent {

  render () {
    return (
      <Column>
        <div className='error-column moo'>
          <GIF src='/the_cow.gif' staticSrc='/the_cow.png' className='error-column__image' />

          <div className='error-column__message'>
            <h1>Have you mooed today?</h1>
            <p>April fools!</p>

            <div className='error-column__message__actions'>
              <Link to='/' className='button'><FormattedMessage id='bundle_column_error.return' defaultMessage='Go back home' /></Link>
            </div>
          </div>
        </div>

        <Helmet>
          <title>Moo!</title>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default Moo;
