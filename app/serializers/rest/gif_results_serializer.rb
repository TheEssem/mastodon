# frozen_string_literal: true

class REST::GifResultsSerializer < ActiveModel::Serializer
  attribute :provider

  class GifResultSerializer < ActiveModel::Serializer
    attributes :id, :description, :url
  end

  has_many :results, serializer: GifResultSerializer
end
