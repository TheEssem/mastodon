# <img src="https://github.com/TheEssem/mastodon/raw/main/app/javascript/icons/android-chrome-256x256.png" width="128"> Chuckya

This is a custom branch of Mastodon/glitch-soc intended for usage on the [wetdry.world](https://wetdry.world) instance.

Here are some of the changes compared to glitch-soc:

- Emoji reactions (glitch-soc/mastodon#2462)
- Tenor GIF picker (originally from [koyu.space](https://github.com/koyuspace/mastodon))
- Mastodon Modern theme (licensed under CC-BY-SA 4.0, [original repo](https://codeberg.org/Freeplay/Mastodon-Modern))
- Workaround for opengraph video embeds when using [Jortage](https://jortage.com)
- Polls can be posted alongside media
- Polls can have only one option
- Restores status trend half-life to 2 hours
- Allows dashes in custom emote names
- Emojis can be put side-by-side
- Unicode emojis use [`jdecked/twemoji`](https://github.com/jdecked/twemoji) v15 graphics
- Minor media attachment tweaks
- Custom favicon

Original glitch-soc readme is below. Setup instructions are the same as glitch-soc's.

# Mastodon Glitch Edition

> Now with automated deploys!

[![Build Status](https://img.shields.io/circleci/project/github/glitch-soc/mastodon.svg)][circleci]
[![Code Climate](https://img.shields.io/codeclimate/maintainability/glitch-soc/mastodon.svg)][code_climate]

[circleci]: https://circleci.com/gh/glitch-soc/mastodon
[code_climate]: https://codeclimate.com/github/glitch-soc/mastodon

So here's the deal: we all work on this code, and anyone who uses that does so absolutely at their own risk. can you dig it?

- You can view documentation for this project at [glitch-soc.github.io/docs/](https://glitch-soc.github.io/docs/).
- And contributing guidelines are available [here](CONTRIBUTING.md) and [here](https://glitch-soc.github.io/docs/contributing/).
