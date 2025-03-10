# frozen_string_literal: true

class Api::V1::GifsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:media' }
  before_action :require_user!
  before_action :set_gif_results

  rescue_from GifService::NotConfiguredError, with: :not_found
  rescue_from GifService::UnexpectedResponseError, with: :service_unavailable

  rescue_from GifService::TooManyRequestsError do
    render json: { error: I18n.t('gif.errors.too_many_requests') }, status: 503
  end

  def index
    render json: @gif_results, serializer: REST::GifResultsSerializer
  end

  private

  def set_gif_results
    return bad_request if params[:q].blank?

    @gif_results = SearchGifsService.new.call(params[:q])
  end
end
