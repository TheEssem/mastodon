# frozen_string_literal: true

class GifResults < ActiveModelSerializers::Model
  attributes :provider, :results

  class GifResult < ActiveModelSerializers::Model
    attributes :id, :description, :url
  end
end
