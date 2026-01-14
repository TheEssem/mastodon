# frozen_string_literal: true

class GifService::Klipy < GifService
  include JsonLdHelper

  def initialize(api_key)
    super()

    @api_key = api_key
  end

  def search(query)
    params = { q: query, customer_id: Rails.configuration.x.web_domain, locale: I18n.locale.to_s, format_filter: 'mp4', per_page: 12 }
    request(:get, @api_key, '/gifs/search', params: params) do |res|
      transform_response(res.body_with_limit)
    end
  end

  private

  def request(verb, key, path, **)
    req = Request.new(verb, "#{base_url}#{key}#{path}", **)
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
    'https://api.klipy.com/api/v1/'
  end

  def transform_response(json)
    data = Oj.load(json, mode: :strict)
    raise UnexpectedResponseError unless data.is_a?(Hash)

    results = data['data']['data'].map do |media_response|
      GifResults::GifResult.new(id: media_response['id'], url: media_response['file']['hd']['mp4']['url'], description: media_response['title'])
    end
    GifResults.new(provider: 'Klipy', results: results)
  rescue Oj::ParseError
    raise UnexpectedResponseError
  end
end
