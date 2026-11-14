"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const results = $("players-results");
  const followingResults = $("following-results");
  const status = $("players-status");
  let signedIn = false;
  let currentUserId = null;

  function showStatus(message, error = false) {
    status.textContent = message;
    status.classList.toggle("error", error);
  }

  function makeCard(user, isFollowingList = false) {
    const card = document.createElement("article");
    card.className = "player-card";
    const name = document.createElement("h3");
    name.className = "list-card-title";
    name.textContent = user.nome;
    const count = document.createElement("p");
    count.className = "review-meta";
    count.textContent = `${user.seguidores} ${user.seguidores === 1 ? "seguidor" : "seguidores"}`;
    const actions = document.createElement("div");
    actions.className = "player-card-actions";
    const profileLink = document.createElement("a");
    profileLink.className = "filter-action";
    profileLink.href = `/pages/perfil.html?id=${encodeURIComponent(user.id)}`;
    profileLink.textContent = "VER PERFIL";
    actions.append(profileLink);

    if (signedIn && user.id !== currentUserId) {
      const followButton = document.createElement("button");
      followButton.type = "button";
      followButton.className = "filter-action primary";
      followButton.textContent = isFollowingList || user.seguindo ? "DEIXAR DE SEGUIR" : "SEGUIR";
      followButton.addEventListener("click", async () => {
        followButton.disabled = true;
        try {
          if (isFollowingList || user.seguindo) {
            await window.GameboxApi.unfollowUser(user.id);
          } else {
            await window.GameboxApi.followUser(user.id);
          }
          showStatus(isFollowingList || user.seguindo ? `Você deixou de seguir ${user.nome}.` : `Você está seguindo ${user.nome}.`);
          await Promise.all([loadUsers(), loadFollowing()]);
        } catch (error) {
          showStatus(error.message, true);
          followButton.disabled = false;
        }
      });
      actions.append(followButton);
    }

    card.append(name, count, actions);
    return card;
  }

  async function loadUsers() {
    results.replaceChildren(Object.assign(document.createElement("p"), {
      className: "review-meta",
      textContent: "Carregando jogadores…"
    }));
    try {
      const users = await window.GameboxApi.listUsers($("players-search").value.trim());
      results.replaceChildren(...users.map((user) => makeCard(user)));
      if (!users.length) {
        results.append(Object.assign(document.createElement("p"), {
          className: "review-meta",
          textContent: "Nenhum jogador encontrado."
        }));
      }
    } catch (error) {
      results.replaceChildren(Object.assign(document.createElement("p"), {
        className: "form-status error",
        textContent: error.message
      }));
    }
  }

  async function loadFollowing() {
    if (!signedIn) return;
    try {
      const users = await window.GameboxApi.listFollowing();
      followingResults.replaceChildren(...users.map((user) => makeCard(user, true)));
      if (!users.length) {
        followingResults.append(Object.assign(document.createElement("p"), {
          className: "review-meta",
          textContent: "Você ainda não segue jogadores."
        }));
      }
    } catch (error) {
      followingResults.replaceChildren(Object.assign(document.createElement("p"), {
        className: "form-status error",
        textContent: error.message
      }));
    }
  }

  $("players-search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    loadUsers();
  });

  $("players-logout").addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    try {
      await window.GameboxApi.logout();
      window.location.reload();
    } catch (error) {
      event.currentTarget.disabled = false;
      showStatus(error.message, true);
    }
  });

  async function initialize() {
    try {
      const { usuario } = await window.GameboxApi.currentUser();
      signedIn = true;
      currentUserId = usuario.id;
      $("players-user").textContent = `OLÁ, ${usuario.nome}`;
      $("players-login").hidden = true;
      $("players-profile").href = `/pages/perfil.html?id=${encodeURIComponent(usuario.id)}`;
      $("players-profile").hidden = false;
      $("players-logout").hidden = false;
      $("following-section").hidden = false;
    } catch (error) {
      if (error.status !== 401) {
        showStatus(error.message, true);
        return;
      }
    }
    await Promise.all([loadUsers(), loadFollowing()]);
  }

  initialize();
})();
