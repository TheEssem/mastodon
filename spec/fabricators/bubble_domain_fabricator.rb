# frozen_string_literal: true

Fabricator(:bubble_domain) do
  domain { sequence(:domain) { |i| "example#{i}.com" } }
end
