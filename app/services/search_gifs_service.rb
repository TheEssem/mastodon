# frozen_string_literal: true

class SearchGifsService < BaseService
  CACHE_TTL = 1.day.freeze

  include FormattingHelper

  def call(query)
    @query = query

    raise Mastodon::NotPermittedError unless GifService.configured?

    Rails.cache.fetch("gifs/#{query_hash}", expires_in: CACHE_TTL) { search_backend.search(@query) }
  end

  private

  def search_backend
    @search_backend ||= GifService.configured
  end

  def query_hash
    Digest::SHA256.base64digest(@query)
  end
end
