# frozen_string_literal: true

class StatusRelationshipsPresenter
  PINNABLE_VISIBILITIES = %w(public unlisted private).freeze

  attr_reader :reblogs_map, :favourites_map, :reactions_map, :mutes_map,
              :pins_map, :bookmarks_map, :filters_map, :attributes_map

  def initialize(statuses, current_account_id = nil, **options)
    if current_account_id.nil?
      @reblogs_map    = {}
      @favourites_map = {}
      @reactions_map  = {}
      @bookmarks_map  = {}
      @mutes_map      = {}
      @pins_map       = {}
      @filters_map    = {}
    else
      statuses            = statuses.compact
      status_ids          = statuses.flat_map { |s| [s.id, s.reblog_of_id] }.uniq.compact
      conversation_ids    = statuses.filter_map(&:conversation_id).uniq
      pinnable_status_ids = statuses.map(&:proper).filter_map { |s| s.id if s.account_id == current_account_id && PINNABLE_VISIBILITIES.include?(s.visibility) }

      @filters_map     = build_filters_map(statuses, current_account_id).merge(options[:filters_map] || {})
      @reblogs_map     = Status.reblogs_map(status_ids, current_account_id).merge(options[:reblogs_map] || {})
      @favourites_map  = Status.favourites_map(status_ids, current_account_id).merge(options[:favourites_map] || {})
      @reactions_map   = build_reactions_map(status_ids, current_account_id).merge(options[:reactions_map] || {})
      @bookmarks_map   = Status.bookmarks_map(status_ids, current_account_id).merge(options[:bookmarks_map] || {})
      @mutes_map       = Status.mutes_map(conversation_ids, current_account_id).merge(options[:mutes_map] || {})
      @pins_map        = Status.pins_map(pinnable_status_ids, current_account_id).merge(options[:pins_map] || {})
      @attributes_map  = options[:attributes_map] || {}
    end
  end

  private

  def build_filters_map(statuses, current_account_id)
    active_filters = CustomFilter.cached_filters_for(current_account_id)

    @filters_map = statuses.each_with_object({}) do |status, h|
      filter_matches = CustomFilter.apply_cached_filters(active_filters, status)

      unless filter_matches.empty?
        h[status.id] = filter_matches
        h[status.reblog_of_id] = filter_matches if status.reblog?
      end
    end
  end

  def build_reactions_map(status_ids, current_account_id)
    reactions = StatusReaction.select(
      [:status_id, :name, :custom_emoji_id, 'COUNT(*) as count'].tap do |values|
        values << StatusReaction.value_for_reaction_me_column(current_account_id)
      end
    ).where(status_id: status_ids).group(:status_id, :name, :custom_emoji_id).order(Arel.sql('MIN(created_at)').asc).to_a

    @reactions_map = reactions.each_with_object({}) do |r, h|
      h[r.status_id] = [] if h[r.status_id].nil?
      h[r.status_id].push(StatusReactionPresenter.new(name: r.name, custom_emoji: r.custom_emoji, count: r.count, me: r.me))
    end
  end
end
