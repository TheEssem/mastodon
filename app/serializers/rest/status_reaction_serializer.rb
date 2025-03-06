# frozen_string_literal: true

class REST::StatusReactionSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :name

  attribute :me, if: :include_me?
  attribute :url, if: :custom_emoji?
  attribute :static_url, if: :custom_emoji?
  attribute :count, unless: :exclude_count?

  belongs_to :account, serializer: REST::AccountSerializer, if: :include_account?

  delegate :count, to: :object

  def include_me?
    !exclude_count? && current_user?
  end

  def include_account?
    instance_options[:include_account]
  end

  def exclude_count?
    instance_options[:exclude_count] || !object.respond_to?(:count)
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
