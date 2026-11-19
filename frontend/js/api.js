"use strict";

(() => {
  async function request(path, options = {}) {
    const headers = new Headers(options.headers);

    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    let response;
    try {
      response = await fetch(path, {
        ...options,
        headers,
        credentials: "same-origin"
      });
    } catch (cause) {
      const error = new Error("Não foi possível conectar à Gamebox. Verifique se o servidor está ativo.");
      error.cause = cause;
      throw error;
    }

    let data = null;
    if (response.status !== 204) {
      try {
        data = await response.json();
      } catch (cause) {
        const error = new Error("A API retornou uma resposta inválida.");
        error.status = response.status;
        error.cause = cause;
        throw error;
      }
    }

    if (!response.ok) {
      const error = new Error(data?.erro || "Não foi possível concluir a solicitação.");
      error.status = response.status;
      throw error;
    }

    return data;
  }

  window.GameboxApi = Object.freeze({
    request,
    register: (dados) => request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(dados)
    }),
    login: (dados) => request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(dados)
    }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
    currentUser: () => request("/api/auth/me"),
    searchGames: (search, page = 1, limit = 10, filters = []) => {
      const params = new URLSearchParams({
        search,
        page: String(page),
        limit: String(limit),
        filters: JSON.stringify(filters)
      });
      return request(`/api/games?${params}`);
    },
    getGame: (id) => request(`/api/games/${encodeURIComponent(id)}`),
    listCommunityGames: () => request("/api/games/community"),
    listLibrary: () => request("/api/library"),
    addToLibrary: (gamebrainId) => request("/api/library", {
      method: "POST",
      body: JSON.stringify({ gamebrain_id: gamebrainId })
    }),
    updateLibraryStatus: (id, status) => request(`/api/library/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
    removeFromLibrary: (id) => request(`/api/library/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }),
    listReviews: (sort = "recent") => request(`/api/reviews?sort=${encodeURIComponent(sort)}`),
    listActivities: () => request("/api/activities"),
    listFollowingActivities: () => request("/api/activities/following"),
    listUsers: (search = "") => request(`/api/users?search=${encodeURIComponent(search)}`),
    listFollowing: () => request("/api/users/following"),
    getUserProfile: (id) => request(`/api/users/${encodeURIComponent(id)}`),
    followUser: (id) => request(`/api/users/${encodeURIComponent(id)}/follow`, {
      method: "POST"
    }),
    unfollowUser: (id) => request(`/api/users/${encodeURIComponent(id)}/follow`, {
      method: "DELETE"
    }),
    listMyReviews: () => request("/api/reviews/mine"),
    createReview: (gamebrainId, nota, texto) => request("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ gamebrain_id: gamebrainId, nota, texto })
    }),
    updateReview: (id, nota, texto) => request(`/api/reviews/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ nota, texto })
    }),
    deleteReview: (id) => request(`/api/reviews/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }),
    setReviewLike: (id, liked) => request(`/api/reviews/${encodeURIComponent(id)}/like`, {
      method: liked ? "POST" : "DELETE"
    }),
    listPublicLists: () => request("/api/lists/public"),
    listMyLists: () => request("/api/lists/mine"),
    getList: (id) => request(`/api/lists/${encodeURIComponent(id)}`),
    createList: (dados) => request("/api/lists", {
      method: "POST",
      body: JSON.stringify(dados)
    }),
    updateList: (id, dados) => request(`/api/lists/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(dados)
    }),
    deleteList: (id) => request(`/api/lists/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }),
    addGameToList: (id, gamebrainId) => request(`/api/lists/${encodeURIComponent(id)}/games`, {
      method: "POST",
      body: JSON.stringify({ gamebrain_id: gamebrainId })
    }),
    removeGameFromList: (id, gamebrainId) => request(`/api/lists/${encodeURIComponent(id)}/games/${encodeURIComponent(gamebrainId)}`, {
      method: "DELETE"
    })
  });
})();