# frozen_string_literal: true

class REST::StatusReactionSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :name

  attribute :id, unless: :no_id?
  attribute :me, if: :current_user? # are this and count worth keeping?
  attribute :url, if: :custom_emoji?
  attribute :static_url, if: :custom_emoji?
  attribute :count, if: :respond_to_count?

  belongs_to :account, serializer: REST::AccountSerializer, unless: :respond_to_count?

  delegate :count, to: :object

  def respond_to_count?
    object.respond_to?(:count)
  end

  def no_id?
    object.id.nil?
  end

  def current_user?
    !current_user.nil?
  end

  def custom_emoji?
    object.custom_emoji.present?
  end

  def name
    if extern?
      [object.name, '@', object.custom_emoji.domain].join
    else
      object.name
    end
  end

  def url
    full_asset_url(object.custom_emoji.image.url)
  end

  def static_url
    full_asset_url(object.custom_emoji.image.url(:static))
  end

  private

  def extern?
    custom_emoji? && object.custom_emoji.domain.present?
  end
end
