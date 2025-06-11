defmodule SocialScope.Community do
  @moduledoc """
  Label propagation for community detection on an undirected graph.
  """

  @max_iters 20

  @doc """
  Given an adjacency map `%{node => [neighbor, …]}`, returns `%{node => community_label}`.
  """
  def detect(adj) when is_map(adj) do
    # start each node in its own community
    labels = Map.new(adj, fn {k, _v} -> {k, k} end)
    iterate(adj, labels, 0)
  end

  defp iterate(_adj, labels, iter) when iter >= @max_iters, do: labels

  defp iterate(adj, labels, iter) do
    {changed, new_labels} =
      Enum.reduce(adj, {false, labels}, fn {node, neighbors}, {chg?, labs} ->
        freqs =
          neighbors
          |> Enum.map(&labs[&1])
          |> Enum.frequencies()

        # pick the most frequent neighbor label (break ties by min label)
        best_label =
          freqs
          |> Enum.max_by(fn {label, freq} -> {freq, -label} end)
          |> elem(0)

        if best_label != labs[node] do
          {true, Map.put(labs, node, best_label)}
        else
          {chg?, labs}
        end
      end)

    if changed do
      iterate(adj, new_labels, iter + 1)
    else
      new_labels
    end
  end
end
