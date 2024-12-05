# frozen_string_literal: true

class Api::V1::Instances::BubbleDomainsController < Api::V1::Instances::BaseController
  before_action :require_enabled_api!

  vary_by '', if: -> { Setting.show_bubble_domains == 'all' }

  def index
    if Setting.show_bubble_domains == 'all'
      cache_even_if_authenticated!
    else
      cache_if_unauthenticated!
    end

    render json: BubbleDomain.bubble_domains
  end

  private

  def require_enabled_api!
    head 404 unless api_enabled?
  end

  def api_enabled?
    show_bubble_domains_for_all? || show_bubble_domains_to_user?
  end

  def show_bubble_domains_for_all?
    Setting.show_bubble_domains == 'all'
  end

  def show_bubble_domains_to_user?
    Setting.show_bubble_domains == 'users' && user_signed_in?
  end
end
