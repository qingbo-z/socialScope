defmodule SocialScope.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SocialScopeWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:social_scope, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: SocialScope.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: SocialScope.Finch},
      # Start a worker by calling: SocialScope.Worker.start_link(arg)
      # {SocialScope.Worker, arg},
      # Start to serve requests, typically the last entry
      SocialScopeWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SocialScope.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SocialScopeWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
