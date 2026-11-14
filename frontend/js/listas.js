"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const status = $("lists-status");
  const publicContainer = $("public-lists");
  const mineContainer = $("my-lists");
  const detailContainer = $("selected-list-section");
  let signedIn = false;
  let library = [];

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("error", isError);
  }

  function textElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function makeListCard(list, mine = false) {
    const card = document.createElement("article");
    card.className = "list-card";
    const title = textElement("h3", "list-card-title", list.nome);
    const author = textElement("p", "review-meta", mine ? "Sua lista" : `por ${list.autor}`);
    const description = textElement("p", "list-card-description", list.descricao || "Sem descrição.");
    const meta = textElement(
      "p",
      "review-meta",
      `${list.quantidade_jogos} ${list.quantidade_jogos === 1 ? "jogo" : "jogos"} · ${mine ? (list.publica ? "Pública" : "Privada") : "Pública"}`
    );
    const open = document.createElement("button");
    open.type = "button";
    open.className = "filter-action primary";
    open.textContent = "ABRIR LISTA";
    open.addEventListener("click", () => loadList(list.id));
    card.append(title, author, description, meta, open);
    return card;
  }

  function renderSummaries(publicLists, myLists) {
    const myListIds = new Set(myLists.map((list) => list.id));
    const communityLists = publicLists.filter((list) => !myListIds.has(list.id));
    publicContainer.replaceChildren(
      ...(communityLists.length
        ? communityLists.map((list) => makeListCard(list))
        : [textElement("p", "review-meta", "Ainda não há listas públicas.")])
    );
    mineContainer.replaceChildren(
      ...(myLists.length
        ? myLists.map((list) => makeListCard(list, true))
        : [textElement("p", "review-meta", "Você ainda não criou listas.")])
    );
  }

  function renderDetail(list) {
    detailContainer.replaceChildren();
    detailContainer.hidden = false;
    const heading = document.createElement("div");
    heading.className = "list-detail-heading";
    heading.append(
      textElement("div", "section-kicker", list.minha ? "SUA LISTA" : `LISTA PÚBLICA · POR ${list.autor}`),
      textElement("h2", "section-title section-title--lg", list.nome)
    );
    const close = document.createElement("button");
    close.type = "button";
    close.className = "filter-action";
    close.textContent = "FECHAR";
    close.addEventListener("click", () => {
      detailContainer.hidden = true;
      detailContainer.replaceChildren();
    });
    heading.append(close);
    detailContainer.append(heading);
    if (list.descricao) {
      detailContainer.append(textElement("p", "list-card-description", list.descricao));
    }

    if (list.minha) {
      renderOwnerControls(list);
    }

    const games = document.createElement("div");
    games.className = "list-games";
    if (!list.jogos.length) {
      games.append(textElement("p", "review-meta", "Esta lista ainda não tem jogos."));
    } else {
      list.jogos.forEach((game) => games.append(renderGame(game, list.minha)));
    }
    detailContainer.append(games);
    detailContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderOwnerControls(list) {
    const edit = document.createElement("form");
    edit.className = "list-form list-edit-form";
    const nameLabel = document.createElement("label");
    nameLabel.append(document.createTextNode("Nome "));
    const name = document.createElement("input");
    name.name = "nome";
    name.minLength = 2;
    name.maxLength = 80;
    name.required = true;
    name.value = list.nome;
    nameLabel.append(name);

    const descriptionLabel = document.createElement("label");
    descriptionLabel.append(document.createTextNode("Descrição "));
    const description = document.createElement("textarea");
    description.name = "descricao";
    description.maxLength = 500;
    description.rows = 2;
    description.value = list.descricao || "";
    descriptionLabel.append(description);

    const visibilityLabel = document.createElement("label");
    visibilityLabel.className = "list-visibility";
    const visibility = document.createElement("input");
    visibility.type = "checkbox";
    visibility.name = "publica";
    visibility.checked = list.publica;
    visibilityLabel.append(visibility, " Tornar lista pública");
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "filter-action primary";
    save.textContent = "SALVAR ALTERAÇÕES";
    edit.append(nameLabel, descriptionLabel, visibilityLabel, save);
    edit.addEventListener("submit", async (event) => {
      event.preventDefault();
      save.disabled = true;
      try {
        await window.GameboxApi.updateList(list.id, {
          nome: name.value,
          descricao: description.value,
          publica: visibility.checked
        });
        showStatus("Lista atualizada.");
        await loadLists();
        await loadList(list.id);
      } catch (error) {
        showStatus(error.message, true);
      } finally {
        save.disabled = false;
      }
    });
    detailContainer.append(edit);

    const actions = document.createElement("div");
    actions.className = "list-owner-actions";
    const removeList = document.createElement("button");
    removeList.type = "button";
    removeList.className = "library-remove";
    removeList.textContent = "EXCLUIR LISTA";
    removeList.addEventListener("click", async () => {
      if (!window.confirm(`Excluir a lista “${list.nome}” e seus itens?`)) return;
      removeList.disabled = true;
      try {
        await window.GameboxApi.deleteList(list.id);
        detailContainer.hidden = true;
        showStatus("Lista excluída.");
        await loadLists();
      } catch (error) {
        removeList.disabled = false;
        showStatus(error.message, true);
      }
    });
    actions.append(removeList);

    if (library.length) {
      const addForm = document.createElement("form");
      addForm.className = "list-add-game";
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Jogo da biblioteca para adicionar");
      select.required = true;
      select.append(new Option("Escolha um jogo da sua biblioteca", ""));
      library.forEach((game) => {
        const option = new Option(game.titulo, String(game.gamebrain_id));
        option.disabled = list.jogos.some((item) => item.gamebrain_id === game.gamebrain_id);
        select.append(option);
      });
      const add = document.createElement("button");
      add.type = "submit";
      add.className = "filter-action primary";
      add.textContent = "ADICIONAR JOGO";
      addForm.append(select, add);
      addForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        add.disabled = true;
        try {
          await window.GameboxApi.addGameToList(list.id, Number(select.value));
          showStatus("Jogo adicionado à lista.");
          await loadLists();
          await loadList(list.id);
        } catch (error) {
          showStatus(error.message, true);
        } finally {
          add.disabled = false;
        }
      });
      actions.append(addForm);
    } else {
      actions.append(textElement("p", "review-meta", "Adicione jogos à biblioteca antes de incluí-los em listas."));
    }
    detailContainer.append(actions);
  }

  function renderGame(game, mine) {
    const card = document.createElement("article");
    card.className = "list-game-card";
    if (game.capa_url) {
      const image = document.createElement("img");
      image.className = "library-cover";
      image.src = game.capa_url;
      image.alt = `Capa de ${game.titulo}`;
      image.loading = "lazy";
      card.append(image);
    }
    const content = document.createElement("div");
    content.className = "list-game-content";
    const title = textElement("h3", "library-game-title", game.titulo);
    const detail = document.createElement("a");
    detail.className = "game-detail-link";
    detail.href = `/pages/jogo.html?id=${encodeURIComponent(game.gamebrain_id)}`;
    detail.textContent = "VER JOGO";
    content.append(title, detail);
    if (mine) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "library-remove";
      remove.textContent = "REMOVER DA LISTA";
      remove.addEventListener("click", async () => {
        remove.disabled = true;
        try {
          await window.GameboxApi.removeGameFromList(listId, game.gamebrain_id);
          showStatus("Jogo removido da lista.");
          await loadLists();
          await loadList(listId);
        } catch (error) {
          remove.disabled = false;
          showStatus(error.message, true);
        }
      });
      content.append(remove);
    }
    card.append(content);
    return card;
  }

  let listId;
  async function loadList(id) {
    showStatus("");
    try {
      const list = await window.GameboxApi.getList(id);
      listId = list.id;
      renderDetail(list);
    } catch (error) {
      showStatus(error.message, true);
    }
  }

  async function loadLists() {
    showStatus("");
    publicContainer.textContent = "Carregando listas públicas…";
    try {
      const publicLists = await window.GameboxApi.listPublicLists();
      let myLists = [];
      if (signedIn) {
        myLists = await window.GameboxApi.listMyLists();
      }
      renderSummaries(publicLists, myLists);
    } catch (error) {
      publicContainer.replaceChildren(textElement("p", "form-status error", error.message));
      showStatus(error.message, true);
    }
  }

  $("create-list-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("button[type=submit]");
    const data = new FormData(form);
    submit.disabled = true;
    try {
      const list = await window.GameboxApi.createList({
        nome: data.get("nome"),
        descricao: data.get("descricao"),
        publica: data.get("publica") === "on"
      });
      form.reset();
      form.elements.publica.checked = true;
      showStatus("Lista criada.");
      await loadLists();
      await loadList(list.id);
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      submit.disabled = false;
    }
  });

  async function initialize() {
    try {
      const { usuario } = await window.GameboxApi.currentUser();
      signedIn = true;
      $("lists-user").textContent = `OLÁ, ${usuario.nome}`;
      $("create-list-section").hidden = false;
      $("my-lists-section").hidden = false;
      library = await window.GameboxApi.listLibrary();
    } catch (error) {
      if (error.status !== 401) {
        showStatus(error.message, true);
        return;
      }
    }
    await loadLists();
  }

  initialize();
})();
