# frozen_string_literal: true

class CreateBubbleDomains < ActiveRecord::Migration[7.1]
  def change
    create_table :bubble_domains do |t|
      t.string :domain, default: '', null: false

      t.timestamps
    end

    add_index :bubble_domains, :domain, name: :index_bubble_domains_on_domain, unique: true
  end
end
