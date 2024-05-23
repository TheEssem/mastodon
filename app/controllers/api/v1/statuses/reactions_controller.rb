# frozen_string_literal: true

class Api::V1::Statuses::ReactionsController < Api::V1::Statuses::BaseController
  REACTIONS_LIMIT = 30

  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }, only: [:create, :destroy]
  before_action -> { authorize_if_got_token! :read, :'read:accounts' }, only: [:index]
  before_action :require_user!, only: [:create, :destroy]
  before_action :set_reactions, only: [:index]
  after_action :insert_pagination_headers, only: [:index]

  def index
    cache_if_unauthenticated!
    render json: @reactions, each_serializer: REST::StatusReactionSerializer
  end

  def create
    ReactService.new.call(current_account, @status, params[:id])
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    react = current_account.status_reactions.find_by(status_id: params[:status_id], name: params[:id])

    if react
      @status = react.status
      count = [@status.reactions_count - 1, 0].max
      UnreactWorker.perform_async(current_account.id, @status.id, params[:id])
    else
      @status = Status.find(params[:status_id])
      count = @status.reactions_count
      authorize @status, :show?
    end

    relationships = StatusRelationshipsPresenter.new([@status], current_account.id, reactions_map: { @status.id => false }, attributes_map: { @status.id => { reactions_count: count } })
    render json: @status, serializer: REST::StatusSerializer, relationships: relationships
  rescue Mastodon::NotPermittedError
    not_found
  end

  private

  def set_reactions
    @reactions = ordered_reactions.select(
      [:id, :account_id, :name, :custom_emoji_id].tap do |values|
        values << value_for_reaction_me_column(current_account)
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
    if filtered?
      initial_reactions.where(name: params[:emoji])
    else
      initial_reactions
    end
  end

  def filtered?
    params[:emoji].present?
  end

  def value_for_reaction_me_column(account)
    if account.nil?
      'FALSE AS me'
    else
      <<~SQL.squish
        EXISTS(
          SELECT 1
          FROM status_reactions inner_reactions
          WHERE inner_reactions.account_id = #{account.id}
            AND inner_reactions.status_id = status_reactions.status_id
            AND inner_reactions.name = status_reactions.name
            AND (
              inner_reactions.custom_emoji_id = status_reactions.custom_emoji_id
              OR inner_reactions.custom_emoji_id IS NULL
                AND status_reactions.custom_emoji_id IS NULL
            )
        ) AS me
      SQL
    end
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
