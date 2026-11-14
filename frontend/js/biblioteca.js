"use strict";

(() => {
  const list = document.getElementById("library-list");
  const statusMessage = document.getElementById("library-status");
  const count = document.getElementById("library-count");
  const logoutButton = document.getElementById("library-logout");
  const statuses = [
    ["quero_jogar", "Quero jogar"],
    ["jogando", "Jogando"],
    ["pausado", "Pausado"],
    ["concluido", "Concluído"],
    ["abandonado", "Abandonado"]
  ];

  function showError(error) {
    if (error.status === 401) {
      window.location.replace("/pages/login.html");
      return;
    }
    statusMessage.textContent = error.message;
    statusMessage.classList.add("error");
  }

  function createGameCard(game) {
    const card = document.createElement("article");
    card.className = "library-card";

    if (game.capa_url) {
      const image = document.createElement("img");
      image.className = "library-cover";
      image.src = game.capa_url;
      image.alt = `Capa de ${game.titulo}`;
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      card.append(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "library-cover library-cover-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      card.append(placeholder);
    }

    const content = document.createElement("div");
    content.className = "library-card-content";
    const title = document.createElement("h2");
    title.className = "library-game-title";
    title.textContent = game.titulo;
    const meta = document.createElement("p");
    meta.className = "game-meta";
    meta.textContent = game.lancamento
      ? `Lançamento: ${new Date(`${String(game.lancamento).slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR")}`
      : "Data de lançamento indisponível";

    const controls = document.createElement("div");
    controls.className = "library-card-controls";
    const label = document.createElement("label");
    label.className = "library-status-label";
    label.append(document.createTextNode("Status"));
    const select = document.createElement("select");
    select.className = "library-status-select";
    select.setAttribute("aria-label", `Status de ${game.titulo}`);
    statuses.forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      option.selected = value === game.status;
      select.append(option);
    });
    label.append(select);

    const removeButton = document.createElement("button");
    removeButton.className = "library-remove";
    removeButton.type = "button";
    removeButton.textContent = "REMOVER";
    removeButton.addEventListener("click", async () => {
      if (!window.confirm(`Remover “${game.titulo}” da sua biblioteca?`)) return;
      removeButton.disabled = true;
      try {
        await window.GameboxApi.removeFromLibrary(game.biblioteca_id);
        card.remove();
        updateCount();
        showEmptyState();
      } catch (error) {
        removeButton.disabled = false;
        showError(error);
      }
    });

    select.addEventListener("change", async () => {
      const previousStatus = game.status;
      select.disabled = true;
      try {
        const updated = await window.GameboxApi.updateLibraryStatus(
          game.biblioteca_id,
          select.value
        );
        game.status = updated.status;
      } catch (error) {
        select.value = previousStatus;
        showError(error);
      } finally {
        select.disabled = false;
      }
    });

    controls.append(label, removeButton);
    content.append(title, meta, controls);
    card.append(content);
    return card;
  }

  function updateCount() {
    const total = list.querySelectorAll(".library-card").length;
    count.textContent = `${total} ${total === 1 ? "JOGO" : "JOGOS"}`;
  }

  function showEmptyState() {
    if (list.querySelector(".library-card")) return;
    const empty = document.createElement("div");
    empty.className = "library-empty";
    const title = document.createElement("h2");
    title.className = "section-title section-title--lg";
    title.textContent = "SUA BIBLIOTECA ESTÁ VAZIA";
    const description = document.createElement("p");
    description.textContent = "Pesquise o catálogo GameBrain na página inicial e adicione seus jogos favoritos.";
    empty.append(title, description);
    list.replaceChildren(empty);
  }

  async function loadLibrary() {
    statusMessage.textContent = "";
    statusMessage.classList.remove("error");
    list.textContent = "Carregando biblioteca…";
    try {
      const games = await window.GameboxApi.listLibrary();
      list.replaceChildren(...games.map(createGameCard));
      updateCount();
      showEmptyState();
    } catch (error) {
      list.replaceChildren();
      showError(error);
    }
  }

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
      await window.GameboxApi.logout();
      window.location.assign("/");
    } catch (error) {
      logoutButton.disabled = false;
      showError(error);
    }
  });

  loadLibrary();
})();