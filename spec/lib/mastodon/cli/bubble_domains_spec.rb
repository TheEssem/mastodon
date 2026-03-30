# frozen_string_literal: true

require 'rails_helper'
require 'mastodon/cli/bubble_domains'

RSpec.describe Mastodon::CLI::BubbleDomains do
  subject { cli.invoke(action, arguments, options) }

  let(:cli) { described_class.new }
  let(:arguments) { [] }
  let(:options) { {} }

  it_behaves_like 'CLI Command'

  describe '#list' do
    let(:action) { :list }

    context 'with bubble domain record' do
      let!(:domain) { Fabricate(:bubble_domain) }

      it 'lists all the domains by default' do
        expect { subject }
          .to output_results(
            domain.domain
          )
      end
    end
  end

  describe '#add' do
    let(:action) { :add }

    context 'without any options' do
      it 'warns about usage and exits' do
        expect { subject }
          .to raise_error(Thor::Error, 'No domain(s) given')
      end
    end

    context 'when bubble domains exist' do
      let(:options) { {} }
      let(:domain) { 'host.example' }
      let(:arguments) { [domain] }

      before { Fabricate(:bubble_domain, domain: domain) }

      it 'does not add a new domain' do
        expect { subject }
          .to output_results('is already in the bubble')
          .and(not_change(BubbleDomain, :count))
      end
    end

    context 'when no bubble domains exist' do
      let(:domain) { 'host.example' }
      let(:arguments) { [domain] }

      it 'adds a new domain' do
        expect { subject }
          .to output_results('Added 1')
          .and(change(BubbleDomain, :count).by(1))
      end
    end
  end

  describe '#remove' do
    let(:action) { :remove }

    context 'without any options' do
      it 'warns about usage and exits' do
        expect { subject }
          .to raise_error(Thor::Error, 'No domain(s) given')
      end
    end

    context 'when bubble domains exist' do
      let(:domain) { 'host.example' }
      let(:arguments) { [domain] }

      before { Fabricate(:bubble_domain, domain: domain) }

      it 'removes the domain' do
        expect { subject }
          .to output_results('Removed 1')
          .and(change(BubbleDomain, :count).by(-1))
      end
    end

    context 'when no bubble domains exist' do
      let(:domain) { 'host.example' }
      let(:arguments) { [domain] }

      it 'does not remove a domain' do
        expect { subject }
          .to output_results('is not in the bubble')
          .and(not_change(BubbleDomain, :count))
      end
    end
  end
end
