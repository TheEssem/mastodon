# frozen_string_literal: true

class GifService::Tenor < GifService
  include JsonLdHelper

  def initialize(api_key)
    super()

    @api_key = api_key
  end

  def search(query)
    params = { q: query, key: @api_key, client_key: Rails.configuration.x.web_domain, locale: I18n.locale.to_s, media_filter: 'mp4', limit: 12 }
    request(:get, '/v2/search', params: params) do |res|
      transform_response(res.body_with_limit)
    end
  end

  private

  def request(verb, path, **)
    req = Request.new(verb, "#{base_url}#{path}", **)
    req.perform do |res|
      case res.code
      when 429
        raise TooManyRequestsError
      when 200...300
        yield res
      else
        raise UnexpectedResponseError
      end
    end
  end

  def base_url
    'https://tenor.googleapis.com'
  end

  def transform_response(json)
    data = Oj.load(json, mode: :strict)
    raise UnexpectedResponseError unless data.is_a?(Hash)

    results = data['results'].map do |media_response|
      GifResults::GifResult.new(id: media_response['id'], url: media_response['media_formats']['mp4']['url'], description: media_response['content_description'])
    end
    GifResults.new(provider: 'Tenor', results: results)
  rescue Oj::ParseError
    raise UnexpectedResponseError
  end
end
