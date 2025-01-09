# frozen_string_literal: true

require 'rubygems/package'
require_relative 'base'

module Mastodon::CLI
  class Emoji < Base
    include ActionView::Helpers::NumberHelper

    option :prefix
    option :suffix
    option :overwrite, type: :boolean
    option :unlisted, type: :boolean
    option :category
    desc 'import PATH', 'Import emoji from a TAR GZIP archive at PATH'
    long_desc <<-LONG_DESC
      Imports custom emoji from a TAR GZIP archive specified by PATH.

      Existing emoji will be skipped unless the --overwrite option
      is provided, in which case they will be overwritten.

      You can specify a --category under which the emojis will be
      grouped together.

      With the --prefix option, a prefix can be added to all
      generated shortcodes. Likewise, the --suffix option controls
      the suffix of all shortcodes.

      With the --unlisted option, the processed emoji will not be
      visible in the emoji picker (but still usable via other means)
    LONG_DESC
    def import(path)
      imported = 0
      skipped  = 0
      failed   = 0
      category = options[:category] ? CustomEmojiCategory.find_or_create_by(name: options[:category]) : nil

      Gem::Package::TarReader.new(Zlib::GzipReader.open(path)) do |tar|
        tar.each do |entry|
          next unless entry.file? && entry.full_name.end_with?('.png', '.gif')

          filename = File.basename(entry.full_name, '.*')

          # Skip macOS shadow files
          next if filename.start_with?('._')

          shortcode    = [options[:prefix], filename, options[:suffix]].compact.join
          custom_emoji = CustomEmoji.local.find_by('LOWER(shortcode) = ?', shortcode.downcase)

          if custom_emoji && !options[:overwrite]
            skipped += 1
            next
          end

          custom_emoji ||= CustomEmoji.new(shortcode: shortcode, domain: nil)
          custom_emoji.image = StringIO.new(entry.read)
          custom_emoji.image_file_name = File.basename(entry.full_name)
          custom_emoji.visible_in_picker = !options[:unlisted]
          custom_emoji.category = category

          if custom_emoji.save
            imported += 1
          else
            failed += 1
            say('Failure/Error: ', :red)
            say(entry.full_name)
            shell.indent(2) do
              say(custom_emoji.errors[:image].join(', '), :red)
            end
          end
        end
      end

      say("Imported #{imported}, skipped #{skipped}, failed to import #{failed}", color(imported, skipped, failed))
    end

    option :category
    option :overwrite, type: :boolean
    desc 'export PATH', 'Export emoji to a TAR GZIP archive at PATH'
    long_desc <<-LONG_DESC
      Exports custom emoji to 'export.tar.gz' at PATH.

      The --category option dumps only the specified category.
      If this option is not specified, all emoji will be exported.

      The --overwrite option will overwrite an existing archive.
    LONG_DESC
    def export(path)
      exported         = 0
      category         = CustomEmojiCategory.find_by(name: options[:category])
      export_file_name = File.join(path, 'export.tar.gz')

      fail_with_message "Archive already exists! Use '--overwrite' to overwrite it!" if File.file?(export_file_name) && !options[:overwrite]
      fail_with_message "Unable to find category '#{options[:category]}'!" if category.nil? && options[:category]

      File.open(export_file_name, 'wb') do |file|
        Zlib::GzipWriter.wrap(file) do |gzip|
          Gem::Package::TarWriter.new(gzip) do |tar|
            scope = !options[:category] || category.nil? ? CustomEmoji.local : category.emojis
            scope.find_each do |emoji|
              say("Adding '#{emoji.shortcode}'...")
              tar.add_file_simple(emoji.shortcode + File.extname(emoji.image_file_name), 0o644, emoji.image_file_size) do |io|
                io.write Paperclip.io_adapters.for(emoji.image).read
                exported += 1
              end
            end
          end
        end
      end
      say("Exported #{exported}")
    end

    option :remote_only, type: :boolean
    desc 'purge', 'Remove all custom emoji'
    long_desc <<-LONG_DESC
      Removes all custom emoji.

      With the --remote-only option, only remote emoji will be deleted.
    LONG_DESC
    def purge
      scope = options[:remote_only] ? CustomEmoji.remote : CustomEmoji
      scope.in_batches.destroy_all
      say('OK', :green)
    end

    option :shortcode, type: :string
    option :domain, type: :string
    option :concurrency, type: :numeric, default: 5, aliases: [:c]
    option :verbose, type: :boolean, default: false, aliases: [:v]
    option :dry_run, type: :boolean, default: false
    option :force, type: :boolean, default: false
    desc 'refresh', 'Fetch remote emojis'
    long_desc <<-DESC
      Re-downloads custom emojis from other servers.

      Use the --domain option to download emojis from a specific domain.

      Use the --shortcode option to download emojis with a specific shortcode,
      using the shortcode@domain syntax.

      By default, emojis that are believed to be already downloaded will
      not be re-downloaded. To force re-download of every URL, use --force.
    DESC
    def refresh
      if options[:shortcode]
        shortcode, domain = options[:shortcode].split('@')
        emoji = CustomEmoji.where(domain: domain).find_by(shortcode: shortcode)

        fail_with_message 'No such emoji' if emoji.nil?

        scope = CustomEmoji.where(id: emoji.id)
      elsif options[:domain]
        scope = CustomEmoji.where(domain: options[:domain])
      else
        scope = CustomEmoji.remote
      end

      processed, aggregate = parallelize_with_progress(scope) do |custom_emoji|
        next if custom_emoji.image_remote_url.blank? || (!options[:force] && custom_emoji.image_file_name.present?)
        next if DomainBlock.reject_media?(custom_emoji.domain)

        unless dry_run?
          custom_emoji.reset_image!
          custom_emoji.save
        end

        custom_emoji.image_file_size
      end

      say("Downloaded #{processed} custom emojis (approx. #{number_to_human_size(aggregate)})#{dry_run_mode_suffix}", :green, true)
    end

    private

    def color(green, _yellow, red)
      if !green.zero? && red.zero?
        :green
      elsif red.zero?
        :yellow
      else
        :red
      end
    end
  end
end
