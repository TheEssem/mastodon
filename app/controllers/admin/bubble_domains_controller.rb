# frozen_string_literal: true

module Admin
  class BubbleDomainsController < BaseController
    before_action :set_bubble_domain, except: [:index, :new, :create]

    def index
      authorize :bubble_domain, :update?
      @bubble_domains = BubbleDomain.all
    end

    def new
      authorize :bubble_domain, :update?
      @bubble_domain = BubbleDomain.new(domain: params[:_domain])
    end

    def create
      authorize :bubble_domain, :update?

      domain = TagManager.instance.normalize_domain(resource_params[:domain])

      @bubble_domain = BubbleDomain.new(domain: domain)

      if @bubble_domain.save!
        log_action :create, @bubble_domain
        redirect_to admin_bubble_domains_path, notice: I18n.t('admin.bubble_domains.created_msg')
      else
        render :new
      end
    end

    def destroy
      authorize :bubble_domain, :update?
      @bubble_domain.destroy
      log_action :destroy, @bubble_domain
      redirect_to admin_bubble_domains_path
    end

    private

    def set_bubble_domain
      @bubble_domain = BubbleDomain.find(params[:id])
    end

    def resource_params
      params.expect(bubble_domain: [:domain])
    end
  end
end
