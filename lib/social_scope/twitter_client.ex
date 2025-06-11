defmodule SocialScope.TwitterClient do
  @moduledoc """
  Simple Twitter API v2 client to page through the 'following' list for a given user.
  """

  @base_url "https://api.twitter.com/2"

  @config Application.compile_env(:social_scope, __MODULE__)

  @doc """
  Fetches all accounts that `username` is following, paging automatically.
  Returns `{:ok, list_of_accounts}` or `{:error, reason}`.
  """
  def fetch_following(username) when is_binary(username) do
    with {:ok, user_id} <- get_user_id(username) do
      page_following(user_id, [])
    end
  end

  defp page_following(user_id, acc, next_token \\ nil) do
    params =
      [{"max_results", "100"}] ++
        Enum.flat_map([next_token], fn
          nil -> []
          token -> [{"pagination_token", token}]
        end)

    url = @base_url <> "/users/#{user_id}/following?" <> URI.encode_query(params)

    headers = [
      {"authorization", "Bearer #{@config[:bearer_token]}"},
      {"content-type", "application/json"}
    ]

    case Finch.build(:get, url, headers) |> Finch.request(SocialScope.Finch) do
      {:ok, %Finch.Response{status: 200, body: body}} ->
        %{"data" => follows, "meta" => %{"next_token" => next_token}} = Jason.decode!(body)

        all = acc ++ follows

        if next_token do
          page_following(user_id, all, next_token)
        else
          {:ok, all}
        end

      {:ok, %Finch.Response{status: code, body: body}} ->
        {:error, {:http_error, code, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp get_user_id(username) do
    url = @base_url <> "/users/by/username/#{username}"
    headers = [{"authorization", "Bearer #{@config[:bearer_token]}"}]

    case Finch.build(:get, url, headers) |> Finch.request(SocialScope.Finch) do
      {:ok, %Finch.Response{status: 200, body: body}} ->
        %{"data" => %{"id" => id}} = Jason.decode!(body)
        {:ok, id}

      {:ok, %Finch.Response{status: code, body: body}} ->
        {:error, {:http_error, code, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
