# frozen_string_literal: true

class FixStatusReactionTimestamps < ActiveRecord::Migration[8.0]
  def up
    safety_assured do
      execute('ALTER TABLE status_reactions ALTER COLUMN created_at TYPE timestamp USING created_at::timestamp')
      execute('ALTER TABLE status_reactions ALTER COLUMN updated_at TYPE timestamp USING updated_at::timestamp')
    end
  end

  def down
    # stub that does nothing; the prepared schema.db instances are initialized from has simply been wrong in the past
  end
end
