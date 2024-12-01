# frozen_string_literal: true

require 'concurrent'
require_relative 'base'

module Mastodon::CLI
  class BubbleDomains < Base
    desc 'list', 'List domains in the bubble'
    def list
      BubbleDomain.find_each do |entry|
        say(entry.domain.to_s, :white)
      end
    end

    desc 'add [DOMAIN...]', 'Add domains to the bubble'
    def add(*domains)
      fail_with_message 'No domain(s) given' if domains.empty?

      domains = domains.map { |domain| TagManager.instance.normalize_domain(domain) }

      skipped = 0
      processed = 0

      domains.each do |domain|
        if BubbleDomain.exists?(domain: domain)
          say("#{domain} is already in the bubble.", :yellow)
          skipped += 1
          next
        end

        bubble_domain = BubbleDomain.new(domain: domain)
        bubble_domain.save!
        processed += 1
      end

      say("Added #{processed}, skipped #{skipped}", color(processed, 0))
    end

    desc 'remove DOMAIN...', 'Remove domain from the bubble'
    def remove(*domains)
      fail_with_message 'No domain(s) given' if domains.empty?

      skipped = 0
      processed = 0
      failed = 0

      domains.each do |domain|
        entry = BubbleDomain.find_by(domain: domain)

        if entry.nil?
          say("#{domain} is not in the bubble.", :yellow)
          skipped += 1
          next
        end

        result = entry.destroy

        if result
          processed += 1
        else
          say("#{domain} could not be removed.", :red)
          failed += 1
        end
      end

      say("Removed #{processed}, skipped #{skipped}, failed #{failed}", color(processed, failed))
    end

    private

    def color(processed, failed)
      if !processed.zero? && failed.zero?
        :green
      elsif failed.zero?
        :yellow
      else
        :red
      end
    end
  end
end
