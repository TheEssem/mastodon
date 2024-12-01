# frozen_string_literal: true

class BubbleDomainPolicy < ApplicationPolicy
  def update?
    role.can?(:manage_federation)
  end
end
