# frozen_string_literal: true

class NormalizeStatusReactionVariationSelectors < ActiveRecord::Migration[8.1]
  class StatusReaction < ApplicationRecord; end
  class Notification < ApplicationRecord; end

  def up
    StatusReaction.where(custom_emoji_id: nil).find_each do |react|
      normalized_name = Emoji.normalize(react.name)
      next if normalized_name == react.name

      target = StatusReaction.find_by(
        account_id: react.account_id,
        status_id: react.status_id,
        name: normalized_name,
        custom_emoji_id: nil
      )

      if target.nil?
        react.update_columns(name: normalized_name)
      else
        merge_reaction!(source: react, target: target)
      end
    end
  end

  private

  def merge_reaction!(source:, target:)
    StatusReaction.transaction do
      merge_notifications!(source: source, target: target)

      source_created_at = source.created_at
      source_updated_at = source.updated_at

      source.delete

      # If the migration were to be interrupted here, there would be "data loss" only for these timestamps.
      # Everything else in this migration runs idempotently.
      target.update_columns(
        created_at: [target.created_at, source_created_at].min,
        updated_at: [target.updated_at, source_updated_at].max
      )
    end
  end

  def merge_notifications!(source:, target:)
    source_notifications = Notification.where(activity_type: 'StatusReaction', activity_id: source.id)
    return if source_notifications.empty?

    target_notification_account_ids = Notification
      .where(activity_type: 'StatusReaction', activity_id: target.id)
      .pluck(:account_id)

    source_notifications.where(account_id: target_notification_account_ids).delete_all
    source_notifications.update_all(activity_id: target.id)
  end
end
