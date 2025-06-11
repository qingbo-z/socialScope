defmodule SocialScopeWeb.GraphLive do
  use SocialScopeWeb, :live_view

  alias SocialScope.{TwitterClient, Community}

  @impl true
  def mount(_params, _session, socket) do
    socket = assign(socket, username: "ripple0328", loading: false, graph: nil)
    {:ok, socket}
  end

  @impl true
  def handle_event("fetch", %{"username" => user}, socket) do
    socket = assign(socket, loading: true, graph: nil)
    send(self(), {:do_fetch, user})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:do_fetch, username}, socket) do
    result =
      case TwitterClient.fetch_following(username) do
        {:ok, followees} ->
          ids = Enum.map(followees, & &1["username"])
          adj = Map.new(ids, fn id -> {id, []} end) |> Map.put(username, ids)
          labels = Community.detect(adj)
          nodes = for(id <- Map.keys(adj), do: %{id: id, community: labels[id] || id})
          edges = for(id <- ids, do: %{source: username, target: id})
          %{nodes: nodes, edges: edges}

        {:error, reason} ->
          %{error: inspect(reason)}
      end

    socket =
      socket
      |> assign(username: username, loading: false)
      |> assign(graph: result)

    {:noreply, socket}
  end
end
