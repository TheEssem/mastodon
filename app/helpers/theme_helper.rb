# frozen_string_literal: true

module ThemeHelper
  def theme_style_tags(flavour_and_skin)
    flavour, theme = flavour_and_skin

    if theme == 'system'
      ''.html_safe.tap do |tags|
        tags << vite_stylesheet_tag("skins/#{flavour}/mastodon-light", type: :virtual, media: 'not all and (prefers-color-scheme: dark)', crossorigin: 'anonymous')
        tags << vite_stylesheet_tag("skins/#{flavour}/default", type: :virtual, media: '(prefers-color-scheme: dark)', crossorigin: 'anonymous')
      end
    elsif theme == 'system-modern'
      ''.html_safe.tap do |tags|
        tags << vite_stylesheet_tag("skins/#{flavour}/modern-light", type: :virtual, media: 'not all and (prefers-color-scheme: dark)', crossorigin: 'anonymous')
        tags << vite_stylesheet_tag("skins/#{flavour}/modern-dark", type: :virtual, media: '(prefers-color-scheme: dark)', crossorigin: 'anonymous')
      end
    else
      vite_stylesheet_tag "skins/#{flavour}/#{theme}", type: :virtual, media: 'all', crossorigin: 'anonymous'
    end
  end

  def theme_color_tags(flavour_and_skin)
    _, theme = flavour_and_skin

    if ['system', 'system-modern'].include?(theme)
      ''.html_safe.tap do |tags|
        tags << tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:dark], media: '(prefers-color-scheme: dark)')
        tags << tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:light], media: '(prefers-color-scheme: light)')
      end
    else
      tag.meta name: 'theme-color', content: theme_color_for(theme)
    end
  end

  def custom_stylesheet
    return if active_custom_stylesheet.blank?

    stylesheet_link_tag(
      custom_css_path(active_custom_stylesheet),
      host: root_url,
      media: :all,
      skip_pipeline: true
    )
  end

  private

  def active_custom_stylesheet
    return if cached_custom_css_digest.blank?

    [:custom, cached_custom_css_digest.to_s.first(8)]
      .compact_blank
      .join('-')
  end

  def cached_custom_css_digest
    Rails.cache.fetch(:setting_digest_custom_css) do
      Setting.custom_css&.then { |content| Digest::SHA256.hexdigest(content) }
    end
  end

  def theme_color_for(theme)
    ['mastodon-light', 'modern-light'].include?(theme) ? Themes::THEME_COLORS[:light] : Themes::THEME_COLORS[:dark]
  end
end
