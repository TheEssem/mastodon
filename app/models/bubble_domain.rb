# frozen_string_literal: true

# == Schema Information
#
# Table name: bubble_domains
#
#  id         :bigint(8)        not null, primary key
#  domain     :string           default(""), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class BubbleDomain < ApplicationRecord
  include Paginable
  include DomainNormalizable
  include DomainMaterializable

  validates :domain, presence: true, uniqueness: true, domain: true

  scope :matches_domain, ->(value) { where(arel_table[:domain].matches("%#{value}%")) }

  def to_log_human_identifier
    domain
  end

  class << self
    def in_bubble?(domain)
      !rule_for(domain).nil?
    end

    def bubble_domains
      pluck(:domain)
    end

    def rule_for(domain)
      return if domain.blank?

      uri = Addressable::URI.new.tap { |u| u.host = domain.delete('/') }

      find_by(domain: uri.normalized_host)
    end
  end
end
