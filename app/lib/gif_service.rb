# frozen_string_literal: true

class GifService
  class Error < StandardError; end
  class NotConfiguredError < Error; end
  class TooManyRequestsError < Error; end
  class UnexpectedResponseError < Error; end

  def self.configured
    if configuration.tenor[:api_key].present?
      GifService::Tenor.new(
        configuration.tenor[:api_key]
      )
    else
      raise NotConfiguredError
    end
  end

  def self.configured?
    configuration.tenor[:api_key].present?
  end

  def self.configuration
    Rails.configuration.x.gifs
  end
end
