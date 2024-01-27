import type { Account } from 'flavours/glitch/models/account';
import type { StatusReaction } from 'flavours/glitch/models/reaction';

import { useHovering } from '../hooks/useHovering';
import { autoPlayGif } from '../initial_state';

import { Emoji } from './status_reactions';

interface Props {
  account: Account | undefined; // FIXME: remove `undefined` once we know for sure its always there
  friend?: Account | undefined; // FIXME: remove `undefined` once we know for sure its always there
  emoji?: StatusReaction | undefined;
  size?: number;
  baseSize?: number;
  overlaySize?: number;
}

export const AvatarOverlay: React.FC<Props> = ({
  account,
  friend,
  emoji,
  size = 46,
  baseSize = 36,
  overlaySize = 24,
}) => {
  const { hovering, handleMouseEnter, handleMouseLeave } =
    useHovering(autoPlayGif);
  const accountSrc = hovering
    ? account?.get('avatar')
    : account?.get('avatar_static');
  const friendSrc = hovering
    ? friend?.get('avatar')
    : friend?.get('avatar_static');

  let overlayElement;
  if (friendSrc) {
    overlayElement = (
      <div
        className='account__avatar'
        style={{ width: `${overlaySize}px`, height: `${overlaySize}px` }}
        data-avatar-of={`@${friend?.get('acct')}`}
      >
        {friendSrc && <img src={friendSrc} alt={friend?.get('acct')} />}
      </div>
    );
  } else {
    overlayElement = (
      <div className='account__emoji' data-emoji-name={emoji?.name}>
        {emoji && (
          <Emoji
            emoji={emoji.name}
            hovered={hovering}
            url={emoji.url}
            staticUrl={emoji.static_url}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className='account__avatar-overlay'
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='account__avatar-overlay-base'>
        <div
          className='account__avatar'
          style={{ width: `${baseSize}px`, height: `${baseSize}px` }}
          data-avatar-of={`@${account?.get('acct')}`}
        >
          {accountSrc && <img src={accountSrc} alt={account?.get('acct')} />}
        </div>
      </div>
      <div className='account__avatar-overlay-overlay'>{overlayElement}</div>
    </div>
  );
};
