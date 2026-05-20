import { Emoji } from 'flavours/glitch/components/emoji';
import { CustomEmojiProvider } from 'flavours/glitch/components/emoji/context';
import { isUnicodeEmoji } from 'flavours/glitch/features/emoji/utils';
import { useHovering } from 'flavours/glitch/hooks/useHovering';
import { autoPlayGif } from 'flavours/glitch/initial_state';
import type { Account } from 'flavours/glitch/models/account';
import type { StatusReaction } from 'flavours/glitch/models/reaction';

interface Props {
  account: Account | undefined; // FIXME: remove `undefined` once we know for sure its always there
  friend?: Account;
  emoji?: StatusReaction;
  size?: number;
  baseSize?: number;
  overlaySize?: number;
}

const handleImgLoadError = (error: { currentTarget: HTMLElement }) => {
  //
  // When the img tag fails to load the image, set the img tag to display: none. This prevents the
  // alt-text from overrunning the containing div.
  //
  error.currentTarget.style.display = 'none';
};

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
        {friendSrc && (
          <img
            src={friendSrc}
            alt={friend?.get('acct')}
            onError={handleImgLoadError}
          />
        )}
      </div>
    );
  } else if (emoji) {
    const code = isUnicodeEmoji(emoji.name) ? emoji.name : `:${emoji.name}:`;
    let custom;
    if (emoji.url) {
      custom = {
        [emoji.name]: {
          shortcode: emoji.name,
          static_url: emoji.static_url,
          url: emoji.url,
        },
      };
    }

    overlayElement = (
      <div className='account__emoji' data-emoji-name={emoji.name}>
        <CustomEmojiProvider emojis={custom}>
          <Emoji code={code} />
        </CustomEmojiProvider>
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
          {accountSrc && (
            <img
              src={accountSrc}
              alt={account?.get('acct')}
              onError={handleImgLoadError}
            />
          )}
        </div>
      </div>
      <div className='account__avatar-overlay-overlay'>{overlayElement}</div>
    </div>
  );
};
