# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin Bubble Domains' do
  describe 'POST /admin/bubble_domains' do
    before { sign_in Fabricate(:admin_user) }

    it 'gracefully handles invalid nested params' do
      post admin_bubble_domains_path(bubble_domain: 'invalid')

      expect(response)
        .to have_http_status(400)
    end
  end
end
