# frozen_string_literal: true

class AddReactionCountsToStatusStat < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    Status.unscoped.includes(:status_stat).find_each do |status|
      status.status_stat.tap do |status_stat|
        reaction_count = status.status_reactions.count
        if reaction_count.positive?
          status_stat.reactions_count = reaction_count
          status_stat.save
        end
      end
    end
  end

  def down
    StatusStat.unscoped.in_batches.update_all(reactions_count: 0)
  end
end
