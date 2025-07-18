# frozen_string_literal: true

class AnnualReport::MostRebloggedAccounts < AnnualReport::Source
  MINIMUM_REBLOGS = 1
  SET_SIZE = 10

  def generate
    {
      most_reblogged_accounts: most_reblogged_accounts.map do |(account_id, count)|
                                 {
                                   account_id: account_id.to_s,
                                   count: count,
                                 }
                               end,
    }
  end

  private

  def most_reblogged_accounts
    report_statuses.only_reblogs.joins(reblog: :account).group(accounts: [:id]).having(minimum_reblog_count).order(count_all: :desc).limit(SET_SIZE).count
  end

  def minimum_reblog_count
    Arel.star.count.gt(MINIMUM_REBLOGS)
  end
end
