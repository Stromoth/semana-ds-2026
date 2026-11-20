"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const status = $("profile-status");
  const statusNames = {
    quero_jogar: "Quero jogar",
    jogando: "Jogando",
    pausado: "Pausado",
    concluido: "Concluído",
    abandonado: "Abandonado"
  };
  let profile;

  function showStatus(message, error = false) {
    status.textContent = message;
    status.classList.toggle("error", error);
  }

  function renderLibrary(games) {
    const container = $("profile-library");
    if (!games.length) {
      container.replaceChildren(Object.assign(document.createElement("p"), {
        className: "review-meta",
        textContent: "Esta biblioteca ainda está vazia."
      }));
      return;
    }

    container.replaceChildren(...games.map((game) => {
      const card = document.createElement("article");
      card.className = "profile-game-card";
      if (game.capa_url) {
        const image = document.createElement("img");
        image.className = "library-cover";
        image.src = game.capa_url;
        image.alt = `Capa de ${game.titulo}`;
        image.loading = "lazy";
        card.append(image);
      }
      const content = document.createElement("div");
      const link = document.createElement("a");
      link.className = "library-game-title game-detail-link";
      link.href = `/pages/jogo.html?id=${encodeURIComponent(game.gamebrain_id)}`;
      link.textContent = game.titulo;
      const gameStatus = document.createElement("p");
      gameStatus.className = "review-meta";
      gameStatus.textContent = statusNames[game.status] || game.status;
      content.append(link, gameStatus);
      card.append(content);
      return card;
    }));
  }

  function renderReviews(reviews) {
    const container = $("profile-reviews");
    if (!reviews.length) {
      container.replaceChildren(Object.assign(document.createElement("p"), {
        className: "review-meta",
        textContent: "Este jogador ainda não publicou avaliações."
      }));
      return;
    }

    container.replaceChildren(...reviews.map((review) => {
      const card = document.createElement("article");
      card.className = "profile-review-card";
      const heading = document.createElement("div");
      heading.className = "profile-review-heading";
      const title = document.createElement("a");
      title.href = `/pages/jogo.html?id=${encodeURIComponent(review.gamebrain_id)}`;
      title.textContent = review.titulo;
      const rating = document.createElement("span");
      rating.className = "stars";
      rating.textContent = `${"★".repeat(review.nota)}${"☆".repeat(5 - review.nota)}`;
      rating.setAttribute("aria-label", `${review.nota} de 5 estrelas`);
      heading.append(title, rating);
      const text = document.createElement("p");
      text.className = "review-copy";
      text.textContent = review.texto;
      const date = document.createElement("p");
      date.className = "review-meta";
      date.textContent = new Date(review.atualizada_em || review.criada_em).toLocaleDateString("pt-BR");
      card.append(heading, text, date);
      return card;
    }));
  }

  function render(profileData) {
    profile = profileData;
    document.title = `${profile.nome} · Gamebox`;
    $("profile-name").textContent = profile.nome;
    $("profile-joined").textContent = `Na Gamebox desde ${new Date(profile.criado_em).toLocaleDateString("pt-BR")}`;
    $("profile-library-count").textContent = profile.biblioteca.length;
    $("profile-reviews-count").textContent = profile.avaliacoes.length;
    $("profile-followers-count").textContent = profile.seguidores;
    $("profile-following-count").textContent = profile.seguindo;
    renderLibrary(profile.biblioteca);
    renderReviews(profile.avaliacoes);

    const followButton = $("profile-follow");
    followButton.hidden = profile.meu_perfil;
    if (!profile.meu_perfil) {
      followButton.textContent = profile.seguido_pelo_visitante ? "DEIXAR DE SEGUIR" : "SEGUIR";
    }
    $("profile-content").hidden = false;
    $("profile-error").hidden = true;
  }

  $("profile-follow").addEventListener("click", async () => {
    const button = $("profile-follow");
    button.disabled = true;
    try {
      if (profile.seguido_pelo_visitante) {
        await window.GameboxApi.unfollowUser(profile.id);
      } else {
        await window.GameboxApi.followUser(profile.id);
      }
      showStatus(profile.seguido_pelo_visitante ? "Você deixou de seguir este jogador." : "Você está seguindo este jogador.");
      const updated = await window.GameboxApi.getUserProfile(profile.id);
      render(updated);
    } catch (error) {
      if (error.status === 401) {
        status.classList.remove("error");
        status.replaceChildren(document.createTextNode("Entre na sua conta para seguir jogadores. "));
        const login = document.createElement("a");
        login.href = "/pages/login.html";
        login.textContent = "Entrar";
        status.append(login);
      } else {
        showStatus(error.message, true);
      }
    } finally {
      button.disabled = false;
    }
  });

  async function initialize() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id || !/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
      $("profile-error").textContent = "Perfil inválido.";
      $("profile-error").classList.add("error");
      return;
    }

    try {
      render(await window.GameboxApi.getUserProfile(id));
    } catch (error) {
      $("profile-error").textContent = error.message;
      $("profile-error").classList.add("error");
    }
  }

  initialize();
})();
