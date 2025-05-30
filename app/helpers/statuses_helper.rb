# frozen_string_literal: true

module StatusesHelper
  VISIBLITY_ICONS = {
    public: 'globe',
    unlisted: 'lock_open',
    private: 'lock',
    direct: 'alternate_email',
  }.freeze

  def nothing_here(extra_classes = '')
    tag.div(class: ['nothing-here', extra_classes]) do
      t('accounts.nothing_here')
    end
  end

  def attachment_types(status)
    attachments = { image: 0, video: 0, audio: 0 }

    status.ordered_media_attachments.each do |media|
      if media.video? || media.gifv?
        attachments[:video] += 1
      elsif media.audio?
        attachments[:audio] += 1
      else
        attachments[:image] += 1
      end
    end

    attachments
  end

  def media_summary(status)
    attachments = attachment_types(status)

    text = attachments.to_a.reject { |_, value| value.zero? }.map { |key, value| I18n.t("statuses.attached.#{key}", count: value) }.join(' · ')

    return if text.blank?

    I18n.t('statuses.attached.description', attached: text)
  end

  def status_text_summary(status)
    return if status.spoiler_text.blank?

    I18n.t('statuses.content_warning', warning: status.spoiler_text)
  end

  def poll_summary(status)
    return unless status.preloadable_poll

    status.preloadable_poll.options.map { |o| "[ ] #{o}" }.join("\n")
  end

  def status_description(status)
    components = [[media_summary(status), status_text_summary(status)].compact_blank.join(' · ')]

    if status.spoiler_text.blank?
      components << status.text
      components << poll_summary(status)
    end

    components.compact_blank.join("\n\n")
  end

  def visibility_icon(status)
    VISIBLITY_ICONS[status.visibility.to_sym]
  end

  def prefers_autoplay?
    ActiveModel::Type::Boolean.new.cast(params[:autoplay]) || current_user&.setting_auto_play_gif
  end
end
