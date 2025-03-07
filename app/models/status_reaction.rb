# frozen_string_literal: true

# == Schema Information
#
# Table name: status_reactions
#
#  id              :bigint(8)        not null, primary key
#  account_id      :bigint(8)        not null
#  status_id       :bigint(8)        not null
#  name            :string           default(""), not null
#  custom_emoji_id :bigint(8)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
class StatusReaction < ApplicationRecord
  include Paginable

  belongs_to :account
  belongs_to :status, inverse_of: :status_reactions
  belongs_to :custom_emoji, optional: true

  has_one :notification, as: :activity, dependent: :destroy

  validates :name, presence: true
  validates_with StatusReactionValidator

  scope :not_by_excluded_account, ->(account) { where.not(account_id: account.excluded_from_timeline_account_ids) }

  before_validation do
    self.status = status.reblog if status&.reblog?
  end

  before_validation :set_custom_emoji

  after_create :increment_cache_counters
  after_destroy :decrement_cache_counters

  class << self
    def value_for_reaction_me_column(account_id)
      if account_id.nil?
        'FALSE AS me'
      else
        <<~SQL.squish
          EXISTS(
            SELECT 1
            FROM status_reactions inner_reactions
            WHERE inner_reactions.account_id = #{account_id}
              AND inner_reactions.status_id = status_reactions.status_id
              AND inner_reactions.name = status_reactions.name
              AND (
                inner_reactions.custom_emoji_id = status_reactions.custom_emoji_id
                OR inner_reactions.custom_emoji_id IS NULL
                  AND status_reactions.custom_emoji_id IS NULL
              )
          ) AS me
        SQL
      end
    end
  end

  private

  def increment_cache_counters
    status&.increment_count!(:reactions_count)
  end

  def decrement_cache_counters
    return if association(:status).loaded? && status.marked_for_destruction?

    status&.decrement_count!(:reactions_count)
  end

  # Sets custom_emoji to nil when disabled
  def set_custom_emoji
    self.custom_emoji = CustomEmoji.find_by(disabled: false, shortcode: name, domain: custom_emoji.domain) if name.present? && custom_emoji.present?
  end
end
