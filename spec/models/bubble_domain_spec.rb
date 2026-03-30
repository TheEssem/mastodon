# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BubbleDomain do
  describe 'Validations' do
    it { is_expected.to validate_presence_of(:domain) }

    context 'when a normalized domain exists' do
      before { Fabricate(:bubble_domain, domain: 'にゃん') }

      it { is_expected.to_not allow_value('xn--r9j5b5b').for(:domain) }
    end
  end

  describe '.bubble_domains' do
    subject { described_class.bubble_domains }

    context 'without bubble domains' do
      it { is_expected.to be_an(Array).and(be_empty) }
    end

    context 'with bubble domains' do
      let!(:bubble_domain) { Fabricate :bubble_domain }
      let!(:other_bubble_domain) { Fabricate :bubble_domain }

      it { is_expected.to contain_exactly(bubble_domain.domain, other_bubble_domain.domain) }
    end
  end

  describe '.rule_for' do
    subject { described_class.rule_for(domain) }

    let(:domain) { 'host.example' }

    context 'with no records' do
      it { is_expected.to be_nil }
    end

    context 'with matching record' do
      let!(:bubble_domain) { Fabricate :bubble_domain, domain: }

      it { is_expected.to eq(bubble_domain) }
    end

    context 'when called with non normalized string' do
      let!(:bubble_domain) { Fabricate :bubble_domain, domain: }
      let(:domain) { '  HOST.example/' }

      it { is_expected.to eq(bubble_domain) }
    end
  end
end
