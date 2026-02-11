# frozen_string_literal: true

class ChuckyaMigrateUserSkin < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  # Dummy classes, to make migration possible across version changes
  class User < ApplicationRecord; end

  def up
    User.where.not(settings: nil).find_each do |user|
      settings = Oj.load(user.attributes_before_type_cast['settings'])
      next if settings.nil? || settings['skin'].blank? || %w(system-modern modern-dark modern-light modern-contrast).exclude?(settings['skin'])

      case settings['skin']
      when 'modern-dark'
        settings['web.color_scheme'] = 'dark'
        settings['web.contrast'] = 'auto'
      when 'modern-contrast'
        settings['web.color_scheme'] = 'dark'
        settings['web.contrast'] = 'high'
      when 'modern-light'
        settings['web.color_scheme'] = 'light'
        settings['web.contrast'] = 'auto'
      end

      settings['skin'] = 'modern'

      user.update_column('settings', Oj.dump(settings))
    end
  end
end
