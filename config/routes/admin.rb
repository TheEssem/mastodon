# frozen_string_literal: true

namespace :admin do
  get '/dashboard', to: 'dashboard#index'

  resources :domain_allows, only: [:new, :create, :destroy]
  resources :domain_blocks, only: [:new, :create, :destroy, :update, :edit] do
    collection do
      post :batch
    end
  end

  resources :export_domain_allows, only: [:new] do
    collection do
      get :export, constraints: { format: :csv }
      post :import
    end
  end

  resources :export_domain_blocks, only: [:new] do
    collection do
      get :export, constraints: { format: :csv }
      post :import
    end
  end

  resources :email_domain_blocks, only: [:index, :new, :create] do
    collection do
      post :batch
    end
  end

  resources :action_logs, only: [:index]
  resources :warning_presets, except: [:new, :show]

  namespace :terms_of_service do
    resource :generate, only: [:show, :create]
    resource :history, only: [:show]
    resource :draft, only: [:show, :update]
  end

  resources :terms_of_service, only: [:index] do
    resource :preview, only: [:show], module: :terms_of_service
    resource :test, only: [:create], module: :terms_of_service
    resource :distribution, only: [:create], module: :terms_of_service
  end

  resources :announcements, except: [:show] do
    member do
      post :publish
      post :unpublish
    end

    resource :preview, only: [:show], module: :announcements
    resource :test, only: [:create], module: :announcements
    resource :distribution, only: [:create], module: :announcements
  end

  with_options to: redirect('/admin/settings/branding') do
    get '/settings'
    get '/settings/edit'
  end

  namespace :settings do
    resource :branding, only: [:show, :update], controller: 'branding'
    resource :registrations, only: [:show, :update], controller: 'registrations'
    resource :content_retention, only: [:show, :update], controller: 'content_retention'
    resource :about, only: [:show, :update], controller: 'about'
    resource :appearance, only: [:show, :update], controller: 'appearance'
    resource :discovery, only: [:show, :update], controller: 'discovery'
    resource :other, only: [:show, :update], controller: 'other'
  end

  resources :site_uploads, only: [:destroy]

  resources :invites, only: [:index, :create, :destroy] do
    collection do
      post :deactivate_all
    end
  end

  resources :relays, only: [:index, :new, :create, :destroy] do
    member do
      post :enable
      post :disable
    end
  end

  resources :bubble_domains, only: [:index, :new, :create, :destroy]

  resources :instances, only: [:index, :show, :destroy], constraints: { id: %r{[^/]+} }, format: 'html' do
    member do
      post :clear_delivery_errors
      post :restart_delivery
      post :stop_delivery
    end

    resources :moderation_notes, controller: 'instances/moderation_notes', only: [:create, :destroy]
  end

  resources :rules, only: [:index, :new, :create, :edit, :update, :destroy] do
    member do
      post :move_up
      post :move_down
    end
  end

  resources :webhooks do
    member do
      post :enable
      post :disable
    end

    resource :secret, only: [], controller: 'webhooks/secrets' do
      post :rotate
    end
  end

  resources :reports, only: [:index, :show] do
    resources :actions, only: [:create], controller: 'reports/actions' do
      collection do
        post :preview
      end
    end

    member do
      post :assign_to_self
      post :unassign
      post :reopen
      post :resolve
    end
  end

  resources :report_notes, only: [:create, :destroy]

  resources :accounts, only: [:index, :show, :destroy] do
    member do
      post :enable
      post :unsensitive
      post :unsilence
      post :unsuspend
      post :redownload
      post :remove_avatar
      post :remove_header
      post :memorialize
      post :approve
      post :reject
      post :unblock_email
    end

    collection do
      post :batch
    end

    resource :change_email, only: [:show, :update]
    resource :reset, only: [:create]
    resource :action, only: [:new, :create], controller: 'account_actions'

    resources :statuses, only: [:index, :show] do
      collection do
        post :batch
      end
    end

    resources :relationships, only: [:index]

    resource :confirmation, only: [:create] do
      collection do
        post :resend
      end
    end
  end

  resources :users, only: [] do
    scope module: :users do
      resource :two_factor_authentication, only: [:destroy]
      resource :role, only: [:show, :update]
    end
  end

  resources :custom_emojis, only: [:index, :new, :create] do
    collection do
      post :batch
    end
  end

  resources :ip_blocks, only: [:index, :new, :create] do
    collection do
      post :batch
    end
  end

  resources :roles, except: [:show]
  resources :account_moderation_notes, only: [:create, :destroy]
  resource :follow_recommendations, only: [:show, :update]
  resources :tags, only: [:index, :show, :update]

  namespace :trends do
    resources :links, only: [:index] do
      collection do
        post :batch
      end
    end

    resources :tags, only: [:index] do
      collection do
        post :batch
      end
    end

    resources :statuses, only: [:index] do
      collection do
        post :batch
      end
    end

    namespace :links do
      resources :preview_card_providers, only: [:index], path: :publishers do
        collection do
          post :batch
        end
      end
    end
  end

  namespace :disputes do
    resources :appeals, only: [:index] do
      member do
        post :approve
        post :reject
      end
    end
  end

  resources :software_updates, only: [:index]

  resources :username_blocks, except: [:show, :destroy] do
    collection do
      post :batch
    end
  end
end
