# frozen_string_literal: true

class StatusReactionPresenter < ActiveModelSerializers::Model
  attributes :id, :name, :custom_emoji, :count, :me
end
