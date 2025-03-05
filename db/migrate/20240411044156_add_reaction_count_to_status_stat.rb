# frozen_string_literal: true

class AddReactionCountToStatusStat < ActiveRecord::Migration[7.1]
  def change
    add_column :status_stats, :reactions_count, :bigint, default: 0, null: false
  end
end
