# frozen_string_literal: true

class Api::V1::Statuses::ReactionsController < Api::V1::Statuses::BaseController
  REACTIONS_LIMIT = 30

  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }, only: [:create, :destroy]
  before_action -> { authorize_if_got_token! :read, :'read:accounts' }, only: [:index]
  before_action :require_user!, only: [:create, :destroy]
  after_action :insert_pagination_headers, only: [:index]

  def index
    cache_if_unauthenticated!
    @reactions = set_reactions
    render json: @reactions, each_serializer: REST::StatusReactionSerializer, include_account: true, exclude_count: true
  end

  def create
    ReactService.new.call(current_account, @status, params[:id])
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    react = current_account.status_reactions.find_by(status_id: params[:status_id], name: params[:id])

    reactions = StatusReaction.select(
      [:name, :custom_emoji_id, 'COUNT(*) as count', 'FALSE AS me']
    ).where(status_id: @status.id)

    if react
      @status = react.status
      count = [@status.reactions_count - 1, 0].max
      reactions = reactions.where.not(id: react.id)
      UnreactWorker.perform_async(current_account.id, @status.id, params[:id])
    else
      @status = Status.find(params[:status_id])
      count = @status.reactions_count
      authorize @status, :show?
    end

    reactions = reactions.group(:status_id, :name, :custom_emoji_id).order(Arel.sql('MIN(created_at)').asc).to_a

    relationships = StatusRelationshipsPresenter.new([@status], current_account.id, reactions_map: { @status.id => reactions }, attributes_map: { @status.id => { reactions_count: count } })
    render json: @status, serializer: REST::StatusSerializer, relationships: relationships
  rescue Mastodon::NotPermittedError
    not_found
  end

  private

  def set_reactions
    ordered_reactions.select(
      [:id, :account_id, :name, :custom_emoji_id].tap do |values|
        values << StatusReaction.value_for_reaction_me_column(current_account&.id)
      end
    ).to_a_paginated_by_id(
      limit_param(REACTIONS_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )
  end

  def ordered_reactions
    filtered_reactions.group(:status_id, :id, :account_id, :name, :custom_emoji_id)
  end

  def filtered_reactions
    initial_reactions = StatusReaction.where(status: @status)
    initial_reactions = initial_reactions.not_by_excluded_account(current_account) unless current_account.nil?
    if filtered?
      emoji, domain = params[:emoji].split('@')
      initial_reactions.where(name: emoji).left_outer_joins(:custom_emoji).where(custom_emoji: { domain: domain })
    else
      initial_reactions
    end
  end

  def filtered?
    params[:emoji].present?
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    api_v1_status_reactions_url pagination_params(max_id: pagination_max_id) if records_continue?
  end

  def prev_path
    api_v1_status_reactions_url pagination_params(since_id: pagination_since_id) unless @reactions.empty?
  end

  def pagination_max_id
    @reactions.last.id
  end

  def pagination_since_id
    @reactions.first.id
  end

  def records_continue?
    @reactions.size == limit_param(REACTIONS_LIMIT)
  end

  def pagination_params(core_params)
    params_slice(:limit, :emoji).merge(core_params)
  end
end
