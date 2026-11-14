"use strict";

(() => {
  const status = document.getElementById("game-detail-status");
  const panel = document.getElementById("game-detail");
  const addButton = document.getElementById("game-detail-add");
  const gameId = new URLSearchParams(window.location.search).get("id");
  let game;

  function showError(error) {
    status.textContent = error.status === 401
      ? "Entre na sua conta para adicionar jogos à biblioteca."
      : error.message;
    status.classList.add("error");

    if (error.status === 401) {
      const link = document.createElement("a");
      link.href = "/pages/login.html";
      link.textContent = " Entrar";
      status.append(link);
    }
  }

  function addMeta(label, value) {
    if (!value) return;
    const item = document.createElement("p");
    item.textContent = `${label}: ${value}`;
    document.getElementById("game-detail-meta").append(item);
  }

  async function loadGame() {
    if (!gameId || !/^\d+$/.test(gameId) || Number(gameId) <= 0) {
      showError(new Error("Identificador de jogo inválido."));
      return;
    }

    try {
      game = await window.GameboxApi.getGame(gameId);
      document.title = `${game.titulo} · Gamebox`;
      document.getElementById("game-detail-title").textContent = game.titulo;
      document.getElementById("game-detail-description").textContent =
        game.descricao || "Não há descrição disponível para este jogo.";

      const cover = document.getElementById("game-detail-cover");
      if (game.capa_url) {
        cover.src = game.capa_url;
        cover.alt = `Capa de ${game.titulo}`;
      } else {
        cover.hidden = true;
      }

      addMeta("Lançamento", game.lancamento
        ? new Date(`${String(game.lancamento).slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR")
        : "Não informado");
      addMeta("Nota GameBrain", game.nota === null ? null : `${game.nota.toFixed(1)} / 5`);
      addMeta("Gêneros", game.generos.join(", "));
      addMeta("Plataformas", game.plataformas.join(", "));
      addMeta("Desenvolvedoras", game.desenvolvedoras.join(", "));

      if (game.link) {
        const source = document.getElementById("game-detail-source");
        if (/^https:\/\/gamebrain\.co\//i.test(game.link)) {
          source.href = game.link;
          source.hidden = false;
        }
      }

      panel.hidden = false;
      status.textContent = "";
      status.classList.remove("error");
    } catch (error) {
      showError(error);
    }
  }

  addButton.addEventListener("click", async () => {
    addButton.disabled = true;
    status.textContent = "Adicionando jogo à biblioteca…";
    status.classList.remove("error");
    try {
      await window.GameboxApi.addToLibrary(game.gamebrain_id);
      status.textContent = "Jogo adicionado à sua biblioteca.";
      addButton.textContent = "ADICIONADO";
    } catch (error) {
      addButton.disabled = error.status === 409;
      showError(error);
      if (error.status === 409) addButton.textContent = "JÁ NA BIBLIOTECA";
    }
  });

  loadGame();
})();