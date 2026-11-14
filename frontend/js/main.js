/* =====================================================================
   GAMEBOX — js/main.js (comportamento)
   Ligado a: index.html (carregado no fim do <body>) e css/style.css.
   Convenção dos comentários:
     ↔ HTML = elemento (id, data-*) que existe no index.html
     ↔ CSS  = classe definida em css/style.css
   Seções: 1 Dados · 2 Utilidades · 3 Telas · 4 Busca/Filtros/Carrossel
           5 Curtidas · 6 Formulário de avaliação · 7 Inicialização
   ===================================================================== */
"use strict";

/* Os valores dos filtros e os resultados vêm do catálogo GameBrain. */
const FILTERS = {
  genre: { label: "GÊNERO", options: [] },
  platform: { label: "PLATAFORMA", options: [] }
};
const PAGE_SIZE = 4;
const API_PAGE_SIZE = 10;

/* ---------- 2. UTILIDADES ---------- */
const $ = id => document.getElementById(id);
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function makeButton(text, className, handler) {
  const button = el("button", className, text);
  button.type = "button";
  button.addEventListener("click", handler);
  return button;
}
const formatVotes = v => (v >= 1000 ? Math.round(v / 1000) + "K" : String(v));
const formatRating = r => (r === null ? "—" : r.toFixed(1).replace(".", ","));

/* ---------- 3. TELAS ----------
   ↔ HTML: qualquer elemento com data-screen-target="discover" ou "feed".
   Usa delegação de cliques, então também funciona nos cards criados pelo JS. */
function showScreen(target) {
  const isDiscover = target === "discover";
  $("discover-view").classList.toggle("active", isDiscover);  // ↔ CSS .page-view.active
  $("feed-view").classList.toggle("active", !isDiscover);
  document.querySelectorAll(".view-switch button").forEach(b => b.classList.toggle("selected", b.dataset.screenTarget === target));
  document.querySelectorAll(".nav-link[data-screen-target]").forEach(b => b.classList.toggle("active", b.dataset.screenTarget === target));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("click", event => {
  const button = event.target.closest("[data-screen-target]");
  if (button) showScreen(button.dataset.screenTarget);
});

/* ---------- 4. BUSCA, FILTROS E CARROSSEL ----------
   Uma única fonte de verdade (state); render() redesenha tudo a partir dela. */
const state = {
  query: "",
  filters: { genre: new Set(), platform: new Set() },
  draftFilters: { genre: new Set(), platform: new Set() },
  page: 0,
  remotePage: 1,
  apiResults: [],
  apiTotal: 0,
  mode: "community"
};
let searchTimer;
let searchRequestId = 0;
let communityGames = [];
let communityTotal = 0;

function getResults() {
  return state.apiResults;
}

function mapGameBrainGame(game) {
  const genres = Array.isArray(game.generos) ? game.generos : [];
  const platforms = Array.isArray(game.plataformas) ? game.plataformas : [];
  return {
    id: game.gamebrain_id,
    gamebrain_id: game.gamebrain_id,
    title: game.titulo,
    year: game.ano || (game.lancamento ? Number(String(game.lancamento).slice(0, 4)) : null),
    genres,
    platforms,
    platformLabel: platforms.slice(0, 2).join(" / ") || "Plataforma não informada",
    rating: game.nota,
    votes: game.votos || 0,
    features: [...(game.tags || []), ...(game.modos || [])],
    image: game.capa_url,
    alt: `Capa de ${game.titulo}`
  };
}

function mapCommunityGame(game) {
  return {
    id: game.gamebrain_id,
    gamebrain_id: game.gamebrain_id,
    title: game.titulo,
    year: game.lancamento ? Number(String(game.lancamento).slice(0, 4)) : null,
    genres: [],
    platforms: [],
    platformLabel: "",
    rating: game.nota === null ? null : Number(game.nota),
    votes: game.avaliacoes,
    features: [],
    image: game.capa_url,
    alt: game.capa_url ? `Capa de ${game.titulo}` : "",
    communityMembers: game.jogadores
  };
}

function showAddMessage(container, message, loginRequired = false) {
  container.replaceChildren(document.createTextNode(message));
  if (loginRequired) {
    const link = el("a", "game-card-login", "Entrar");
    link.href = "/pages/login.html";
    container.append(" ", link, " para adicionar jogos.");
  }
}

async function addToLibrary(game, button, status) {
  button.disabled = true;
  status.textContent = "Adicionando à biblioteca…";
  try {
    await window.GameboxApi.addToLibrary(game.gamebrain_id);
    showAddMessage(status, "Jogo adicionado à sua biblioteca.");
    button.textContent = "ADICIONADO";
    button.textContent = "ADICIONADO";
  } catch (error) {
    showAddMessage(status, error.message, error.status === 401);
    button.disabled = error.status === 409;
    if (error.status === 409) button.textContent = "JÁ NA BIBLIOTECA";
    if (error.status !== 401 && error.status !== 409) button.disabled = false;
  }
}

// Cria um card. ↔ CSS: .poster-card, .poster-title, .game-meta...
function makeCard(game) {
  const card = el("article", "poster-card game-card");
  card.dataset.gameId = game.id;
  const image = el("img");
  image.loading = "lazy";
  image.alt = game.alt;
  if (game.image) image.src = game.image;
  else image.hidden = true;
  const votes = el("span");
  votes.append(el("span", "green", "●"), " " + formatVotes(game.votes) + " votos");
  const stats = el("span", "game-meta poster-stats");
  stats.append(votes, el("span", "", "★ " + formatRating(game.rating)));
  const body = el("span", "poster-body");
  const title = game.gamebrain_id ? el("a", "poster-title", game.title) : el("span", "poster-title", game.title);
  if (game.gamebrain_id) title.href = `/pages/jogo.html?id=${encodeURIComponent(game.gamebrain_id)}`;
  const gameMeta = game.communityMembers === undefined
    ? `${game.genres[0] || "Gênero não informado"} • ${game.platformLabel}`
    : `${game.communityMembers} ${game.communityMembers === 1 ? "jogador" : "jogadores"} na biblioteca`;
  body.append(title, el("span", "game-meta poster-genre", gameMeta), stats);
  if (game.gamebrain_id) {
    const addButton = makeButton("ADICIONAR À BIBLIOTECA", "game-card-add", () => {
      addToLibrary(game, addButton, addStatus);
    });
    const addStatus = el("span", "game-card-status");
    addButton.setAttribute("aria-label", `Adicionar ${game.title} à biblioteca`);
    body.append(addButton, addStatus);
  }
  card.append(image, body);
  return card;
}

function render() {
  const results = getResults();
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  if (state.page >= pages) state.page = 0;

  // Cards (↔ HTML #poster-grid) e mensagem de vazio (↔ HTML #empty-search)
  $("poster-grid").replaceChildren(...results.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE).map(makeCard));
  $("empty-search").style.display = results.length ? "none" : "block";
  $("empty-search-text").textContent =
    state.mode === "community"
      ? "Ainda não há jogos nas bibliotecas da comunidade. Pesquise no catálogo acima e adicione um jogo à sua biblioteca para iniciar os destaques."
      : "Nenhum jogo encontrado.";
  $("clear-filters-empty").hidden = state.mode !== "search" || Boolean(results.length);
  if (state.mode === "search") {
    const remotePages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    $("carousel-prev").disabled = state.remotePage <= 1 && state.page <= 0;
    $("carousel-next").disabled =
      state.page < remotePages - 1
        ? false
        : state.remotePage >= 101 || state.remotePage * API_PAGE_SIZE >= state.apiTotal;
  } else {
    $("carousel-prev").disabled = $("carousel-next").disabled = pages <= 1;
  }

  const active = Object.entries(state.filters)
    .flatMap(([type, values]) => [...values].map(value => [type, value]));
  $("active-filter-chips").replaceChildren(...active.map(([type, value]) => {
    const option = FILTERS[type].options.find(item => item.key === value);
    const chip = el("span", "filter-chip", option?.name || value);
    const remove = makeButton("×", "", () => {
      state.filters[type].delete(value);
      state.draftFilters[type].delete(value);
      state.page = 0;
      fetchGameBrainResults(state.query.trim(), 1);
    });
    remove.setAttribute("aria-label", "Remover filtro " + value);
    chip.append(remove);
    return chip;
  }));

  $("filter-result").textContent = state.mode === "search"
    ? `${state.apiTotal} RESULTADO(S)`
    : `${state.apiTotal} JOGOS DA COMUNIDADE`;
  renderFilterPanels();
}

function buildPanels() {
  Object.keys(FILTERS).forEach(type => {
    const panel = document.querySelector(`[data-filter-panel="${type}"]`);
    const trigger = $("filter-" + type);
    trigger.addEventListener("click", () => {
      const opening = panel.hidden;
      closePanels();
      panel.hidden = !opening;
      trigger.setAttribute("aria-expanded", String(opening));
    });
  });
}

function renderFilterPanels() {
  Object.entries(FILTERS).forEach(([type, filter]) => {
    const panel = document.querySelector(`[data-filter-panel="${type}"]`);
    const trigger = $("filter-" + type);
    const selected = state.filters[type];
    const options = [...filter.options];

    selected.forEach(key => {
      if (!options.some(option => option.key === key)) {
        options.push({ key, name: key, count: 0 });
      }
    });

    panel.replaceChildren();
    options.forEach(option => {
      const label = el("label", "filter-option");
      const checkbox = el("input");
      checkbox.type = "checkbox";
      checkbox.value = option.key;
      checkbox.checked = state.draftFilters[type].has(option.key);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) state.draftFilters[type].add(option.key);
        else state.draftFilters[type].delete(option.key);
        label.classList.toggle("selected", checkbox.checked);
      });
      label.classList.toggle("selected", checkbox.checked);
      const optionCount = el("span", "filter-option-count", String(option.count));
      label.append(checkbox, option.name, optionCount);
      panel.append(label);
    });

    const actions = el("div", "filter-actions");
    actions.append(
      makeButton("Limpar", "filter-action", () => {
        state.filters[type].clear();
        state.draftFilters[type].clear();
        state.page = 0;
        closePanels();
        fetchGameBrainResults(state.query.trim(), 1);
      }),
      makeButton("Aplicar", "filter-action primary", () => {
        if (state.draftFilters[type].size > 5) {
          $("game-search-status").textContent = "Selecione no máximo 5 opções por filtro.";
          return;
        }
        state.filters[type] = new Set(state.draftFilters[type]);
        state.page = 0;
        closePanels();
        fetchGameBrainResults(state.query.trim(), 1);
      })
    );
    panel.append(actions);

    const chosenCount = selected.size;
    trigger.textContent = chosenCount
      ? `${filter.label} (${chosenCount})`
      : filter.label;
    trigger.disabled = options.length === 0 || state.mode !== "search";
    trigger.classList.toggle("active", chosenCount > 0);
  });
}
function closePanels() {
  document.querySelectorAll(".filter-popover").forEach(panel => { panel.hidden = true; });
  document.querySelectorAll(".filter-menu-wrap > button").forEach(b => b.setAttribute("aria-expanded", "false"));
}
function resetFilters() {
  state.query = "";
  state.filters.genre.clear();
  state.filters.platform.clear();
  state.draftFilters.genre.clear();
  state.draftFilters.platform.clear();
  FILTERS.genre.options = [];
  FILTERS.platform.options = [];
  state.page = 0;
  state.remotePage = 1;
  state.mode = "community";
  state.apiResults = communityGames;
  state.apiTotal = communityTotal;
  searchRequestId++;
  window.clearTimeout(searchTimer);
  $("game-search-status").textContent = "";
  $("game-search").value = "";
  render();
}
function movePage(direction) {
  if (state.mode === "search") {
    const remotePages = Math.max(1, Math.ceil(getResults().length / PAGE_SIZE));
    const nextLocalPage = state.page + direction;

    if (nextLocalPage >= 0 && nextLocalPage < remotePages) {
      state.page = nextLocalPage;
      render();
      return;
    }

    const nextRemotePage = state.remotePage + direction;
    if (nextRemotePage < 1 || nextRemotePage > 101 || (nextRemotePage - 1) * API_PAGE_SIZE > 1000) return;
    fetchGameBrainResults(state.query.trim(), nextRemotePage, direction < 0);
    return;
  }
  const pages = Math.max(1, Math.ceil(getResults().length / PAGE_SIZE));
  state.page = (state.page + direction + pages) % pages;
  render();
}

async function fetchGameBrainResults(query, page, showLastPage = false) {
  const requestId = ++searchRequestId;
  state.mode = "search";
  const status = $("game-search-status");
  closePanels();
  status.textContent = "Buscando jogos na GameBrain…";
  FILTERS.genre.options = [];
  FILTERS.platform.options = [];
  state.apiResults = [];
  state.apiTotal = 0;
  state.remotePage = page;
  state.page = 0;
  render();

  try {
    const filters = Object.entries(state.filters)
      .filter(([, values]) => values.size > 0)
      .map(([key, values]) => ({
        key,
        values: [...values].map(value => ({ value })),
        connection: "OR"
      }));
    const response = await window.GameboxApi.searchGames(query, page, API_PAGE_SIZE, filters);
    if (requestId !== searchRequestId) return;
    state.apiResults = response.resultados.map(mapGameBrainGame);
    state.apiTotal = response.total;
    for (const filter of response.filtros || []) {
      if (Object.hasOwn(FILTERS, filter.chave)) {
        FILTERS[filter.chave].options = filter.opcoes.map(option => ({
          key: option.chave,
          name: option.nome,
          count: option.total
        }));
      }
    }
    state.draftFilters.genre = new Set(state.filters.genre);
    state.draftFilters.platform = new Set(state.filters.platform);
    state.page = showLastPage
      ? Math.max(0, Math.ceil(state.apiResults.length / PAGE_SIZE) - 1)
      : 0;
    status.textContent = "";
    render();
  } catch (error) {
    if (requestId !== searchRequestId) return;
    state.apiResults = [];
    state.apiTotal = 0;
    status.textContent = error.message;
    render();
  }
}

/* ---------- 5. AVALIAÇÕES PERSISTENTES ----------
   ↔ HTML: #comment-form, #comment-game, #comment-input,
   #publish-button, #comment-status, #review-list e .rating-picker button */
const ownReviewIds = new Set();
function formatReviewDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
}

function buildReview(review) {
  const card = el("article", "review-card");
  const poster = el("img", "review-poster");
  poster.alt = `Capa de ${review.titulo}`;
  poster.loading = "lazy";
  if (review.capa_url) poster.src = review.capa_url;
  else poster.hidden = true;

  const content = el("div");
  const heading = el("div", "flex flex-wrap justify-between gap-3");
  const headingText = el("div");
  const title = el("h2", "review-heading", review.titulo);
  const date = formatReviewDate(review.atualizada_em || review.criada_em);
  const meta = el("p", "review-meta mt-1");
  meta.append("por ");
  if (review.autor_id) {
    const author = el("a", "profile-inline-link", review.autor || "Jogador");
    author.href = `/pages/perfil.html?id=${encodeURIComponent(review.autor_id)}`;
    meta.append(author);
  } else {
    meta.append(review.autor || "Você");
  }
  if (date) meta.append(` · ${date}`);
  const stars = el("span", "stars", `${"★".repeat(review.nota)}${"☆".repeat(5 - review.nota)}`);
  stars.setAttribute("aria-label", `${review.nota} de 5 estrelas`);
  headingText.append(title, meta);
  heading.append(headingText, stars);
  const text = el("p", "review-copy mt-3", review.texto);
  content.append(heading, text);

  const likeButton = makeButton(
    `${review.curtida_pelo_usuario ? "♥" : "♡"} ${review.curtidas || 0} curtidas`,
    `like-button mt-3${review.curtida_pelo_usuario ? " liked" : ""}`,
    () => toggleReviewLike(review, likeButton)
  );
  likeButton.setAttribute("aria-pressed", String(Boolean(review.curtida_pelo_usuario)));
  likeButton.setAttribute("aria-label", review.curtida_pelo_usuario ? "Remover curtida" : "Curtir avaliação");
  content.append(likeButton);

  if (ownReviewIds.has(review.id)) {
    const actions = el("div", "review-card-actions");
    actions.append(
      makeButton("EDITAR", "review-card-action", () => beginReviewEdit(review)),
      makeButton("EXCLUIR", "review-card-action", () => deleteReview(review))
    );
    content.append(actions);
  }

  card.append(poster, content);
  return card;
}

async function toggleReviewLike(review, button) {
  const currentlyLiked = button.getAttribute("aria-pressed") === "true";
  button.disabled = true;
  try {
    await window.GameboxApi.setReviewLike(review.id, !currentlyLiked);
    await loadReviews();
    await loadActivities();
  } catch (error) {
    if (error.status === 401) {
      const notice = $("review-auth-notice");
      notice.replaceChildren(
        document.createTextNode("Entre na sua conta para curtir avaliações. "),
        Object.assign(el("a", "", "Entrar"), { href: "/pages/login.html" })
      );
      notice.hidden = false;
    } else {
      setReviewStatus(error.message, true);
    }
    button.disabled = false;
  }
}

let editingReviewId = null;
let reviewGames = [];
const statusNames = {
  quero_jogar: "Quero jogar",
  jogando: "Jogando",
  pausado: "Pausado",
  concluido: "Concluído",
  abandonado: "Abandonado"
};

function describeActivity(activity) {
  switch (activity.tipo) {
    case "jogo_adicionado":
      return "adicionou à biblioteca";
    case "jogo_removido":
      return "removeu da biblioteca";
    case "status_alterado":
      return `alterou o status para ${statusNames[activity.detalhes?.atual] || "atualizado"}`;
    case "avaliacao_publicada":
      return "publicou uma avaliação";
    case "avaliacao_editada":
      return "editou uma avaliação";
    case "avaliacao_excluida":
      return "removeu uma avaliação";
    case "avaliacao_curtida":
      return "curtiu uma avaliação";
    default:
      return "interagiu com";
  }
}

async function loadActivities() {
  const sidebar = $("network-activity-list");
  const games = $("recent-activity-games");
  const feedSidebar = $("feed-activity-list");
  try {
    const activities = await window.GameboxApi.listActivities();
    sidebar.replaceChildren();
    games.replaceChildren();
    feedSidebar.replaceChildren();

    if (activities.length === 0) {
      sidebar.append(el("p", "review-meta", "Ainda não há atividade da comunidade."));
      games.append(el("p", "review-meta", "Os jogos recentes da comunidade aparecerão aqui."));
      feedSidebar.append(el("p", "review-meta", "Ainda não há atividade da comunidade."));
      return;
    }

    activities.slice(0, 5).forEach(activity => {
      const item = el("p", "network-activity-item");
      const link = el("a", "", activity.titulo);
      link.href = `/pages/jogo.html?id=${encodeURIComponent(activity.gamebrain_id)}`;
      const author = el("a", "profile-inline-link", activity.autor);
      author.href = `/pages/perfil.html?id=${encodeURIComponent(activity.autor_id)}`;
      item.append(author, ` ${describeActivity(activity)} `, link);
      sidebar.append(item);
      feedSidebar.append(item.cloneNode(true));
    });

    const usedGames = new Set();
    for (const activity of activities) {
      if (usedGames.has(activity.gamebrain_id)) continue;
      usedGames.add(activity.gamebrain_id);
      const link = el("a", "recent-activity-game");
      link.href = `/pages/jogo.html?id=${encodeURIComponent(activity.gamebrain_id)}`;
      link.setAttribute("aria-label", `${activity.titulo}: ${activity.autor} ${describeActivity(activity)}`);
      if (activity.capa_url) {
        const image = el("img");
        image.src = activity.capa_url;
        image.alt = "";
        image.loading = "lazy";
        link.append(image);
      }
      link.append(el("span", "", activity.titulo));
      games.append(link);
      if (usedGames.size === 6) break;
    }
  } catch (error) {
    sidebar.replaceChildren(el("p", "form-status error", error.message));
    games.replaceChildren();
    feedSidebar.replaceChildren(el("p", "form-status error", error.message));
  }
}

async function loadCommunityGames() {
  $("game-search-status").textContent = "Carregando jogos da comunidade…";
  try {
    const response = await window.GameboxApi.listCommunityGames();
    communityGames = response.resultados.map(mapCommunityGame);
    communityTotal = response.total;
    if (state.mode === "community" && !state.query.trim()) {
      state.apiResults = communityGames;
      state.apiTotal = communityTotal;
      $("game-search-status").textContent = "";
      render();
    }
  } catch (error) {
    if (state.mode === "community" && !state.query.trim()) {
      $("game-search-status").textContent = error.message;
      $("poster-grid").replaceChildren();
      $("filter-result").textContent = "";
      $("empty-search-text").textContent = "Não foi possível carregar os jogos da comunidade.";
      $("empty-search").style.display = "block";
    }
  }
}

async function loadFollowingActivities() {
  const containers = [$("network-following-activity"), $("feed-following-activity")];
  const renderMessage = (message, isError = false, loginLink = false) => {
    for (const container of containers) {
      const paragraph = el("p", isError ? "form-status error" : "review-meta", message);
      if (loginLink) {
        paragraph.append(" ", Object.assign(el("a", "", "Entre"), { href: "/pages/login.html" }),
          " e siga jogadores para acompanhar a rede.");
      }
      container.replaceChildren(paragraph);
    }
  };

  try {
    const activities = await window.GameboxApi.listFollowingActivities();
    if (!activities.length) {
      renderMessage("Sua rede ainda não tem atividade. Encontre jogadores para acompanhar.", false);
      for (const container of containers) {
        container.lastElementChild.append(" ", Object.assign(el("a", "", "Encontrar jogadores"), {
          href: "/pages/jogadores.html"
        }), ".");
      }
      return;
    }
    for (const container of containers) {
      container.replaceChildren(...activities.slice(0, 5).map(activity => {
        const item = el("p", "network-activity-item");
        const author = el("a", "profile-inline-link", activity.autor);
        author.href = `/pages/perfil.html?id=${encodeURIComponent(activity.autor_id)}`;
        const game = el("a", "", activity.titulo);
        game.href = `/pages/jogo.html?id=${encodeURIComponent(activity.gamebrain_id)}`;
        item.append(author, ` ${describeActivity(activity)} `, game);
        return item;
      }));
    }
  } catch (error) {
    if (error.status === 401) {
      renderMessage("Entre para acompanhar a atividade dos jogadores que segue.", false, true);
    } else {
      renderMessage(error.message, true);
    }
  }
}

function setReviewStatus(message, isError = false) {
  const status = $("comment-status");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function resetReviewForm() {
  editingReviewId = null;
  $("comment-form").reset();
  $("comment-game").disabled = false;
  $("review-form-heading").textContent = "AVALIE UM JOGO DA SUA BIBLIOTECA";
  $("publish-button").textContent = "PUBLICAR AVALIAÇÃO";
  $("cancel-review-edit").hidden = true;
  document.querySelectorAll(".rating-picker button").forEach(button => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
  updateReviewSubmitState();
}

function beginReviewEdit(review) {
  editingReviewId = review.id;
  $("comment-game").value = String(review.gamebrain_id);
  $("comment-game").disabled = true;
  $("comment-input").value = review.texto;
  document.querySelectorAll(".rating-picker button").forEach(button => {
    const selected = Number(button.dataset.score) <= review.nota;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(Number(button.dataset.score) === review.nota));
  });
  $("review-form-heading").textContent = `EDITANDO AVALIAÇÃO: ${review.titulo}`;
  $("publish-button").textContent = "SALVAR ALTERAÇÕES";
  $("cancel-review-edit").hidden = false;
  setReviewStatus("");
  $("comment-form").scrollIntoView({ behavior: "smooth", block: "center" });
}

async function loadReviews() {
  const list = $("review-list");
  list.replaceChildren(el("p", "review-meta", "Carregando avaliações…"));
  try {
    const reviews = await window.GameboxApi.listReviews($("review-sort").value);
    list.replaceChildren(...reviews.map(buildReview));
    if (reviews.length === 0) {
      list.append(el("p", "review-meta", "Ainda não há avaliações. Seja a primeira pessoa a avaliar um jogo."));
    }
  } catch (error) {
    list.replaceChildren(el("p", "form-status error", error.message));
  }
}

async function deleteReview(review) {
  if (!window.confirm(`Excluir sua avaliação de “${review.titulo}”?`)) return;
  try {
    await window.GameboxApi.deleteReview(review.id);
    ownReviewIds.delete(review.id);
    const option = $("comment-game").querySelector(`option[value="${review.gamebrain_id}"]`);
    if (option) {
      option.disabled = false;
      option.textContent = reviewGames.find(game => game.gamebrain_id === review.gamebrain_id)?.titulo || review.titulo;
    }
    if (editingReviewId === review.id) resetReviewForm();
    setReviewStatus("Avaliação excluída.");
    await loadReviews();
    await loadActivities();
  } catch (error) {
    setReviewStatus(error.message, true);
  }
}

function updateReviewSubmitState() {
  const hasScore = document.querySelector(".rating-picker button.selected");
  const canSubmit = Boolean(
    $("comment-input").value.trim() &&
    hasScore &&
    (editingReviewId || ($("comment-game").value && !$("comment-game").disabled))
  );
  $("publish-button").disabled = !canSubmit;
}

async function initReviewForm() {
  const gameSelect = $("comment-game");
  const input = $("comment-input");
  const publishButton = $("publish-button");
  const starButtons = [...document.querySelectorAll(".rating-picker button")];
  const form = $("comment-form");
  const authNotice = $("review-auth-notice");

  try {
    const { usuario } = await window.GameboxApi.currentUser();
    const profileLink = document.querySelector("[data-account-profile]");
    profileLink.href = `/pages/perfil.html?id=${encodeURIComponent(usuario.id)}`;
    profileLink.hidden = false;
    authNotice.hidden = true;
    form.hidden = false;
    const [library, mine] = await Promise.all([
      window.GameboxApi.listLibrary(),
      window.GameboxApi.listMyReviews()
    ]);
    reviewGames = library.filter(game => Number.isSafeInteger(game.gamebrain_id));
    for (const game of reviewGames) {
      const option = new Option(game.titulo, String(game.gamebrain_id));
      option.disabled = mine.some(review => review.gamebrain_id === game.gamebrain_id);
      if (option.disabled) option.textContent += " — já avaliado";
      gameSelect.append(option);
    }
    mine.forEach(review => ownReviewIds.add(review.id));
    if (reviewGames.length === 0) {
      gameSelect.disabled = true;
      setReviewStatus("Adicione um jogo à sua biblioteca antes de avaliá-lo.");
    } else {
      gameSelect.disabled = false;
      setReviewStatus(`Conectado como ${usuario.nome}.`);
    }
  } catch (error) {
    if (error.status === 401) {
      authNotice.replaceChildren(
        document.createTextNode("Entre na sua conta e adicione jogos à biblioteca para publicar uma avaliação. "),
        Object.assign(el("a", "", "Entrar"), { href: "/pages/login.html" })
      );
      authNotice.hidden = false;
      form.hidden = true;
    } else {
      form.hidden = false;
      gameSelect.disabled = true;
      setReviewStatus(error.message, true);
    }
  }

  [gameSelect, input].forEach(control => {
    control.addEventListener("input", updateReviewSubmitState);
    control.addEventListener("change", updateReviewSubmitState);
  });
  $("review-sort").addEventListener("change", loadReviews);
  starButtons.forEach(star => star.addEventListener("click", () => {
    const score = Number(star.dataset.score);
    starButtons.forEach(button => {
      button.classList.toggle("selected", Number(button.dataset.score) <= score);
      button.setAttribute("aria-pressed", String(Number(button.dataset.score) === score));
    });
    updateReviewSubmitState();
  }));

  $("cancel-review-edit").addEventListener("click", () => {
    resetReviewForm();
    setReviewStatus("");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const nota = Number(document.querySelector(".rating-picker button[aria-pressed='true']")?.dataset.score);
    const text = input.value.trim();
    const gamebrainId = Number(gameSelect.value);
    publishButton.disabled = true;
    setReviewStatus(editingReviewId ? "Salvando alterações…" : "Publicando avaliação…");
    try {
      if (editingReviewId) {
        await window.GameboxApi.updateReview(editingReviewId, nota, text);
      } else {
        await window.GameboxApi.createReview(gamebrainId, nota, text);
      }
      const wasEditing = Boolean(editingReviewId);
      resetReviewForm();
      const reviewedIds = await window.GameboxApi.listMyReviews();
      ownReviewIds.clear();
      reviewedIds.forEach(review => ownReviewIds.add(review.id));
      gameSelect.querySelectorAll("option").forEach(option => {
        if (option.value) {
          option.disabled = reviewedIds.some(review => String(review.gamebrain_id) === option.value);
          option.textContent = reviewGames.find(game => String(game.gamebrain_id) === option.value)?.titulo +
            (option.disabled ? " — já avaliado" : "");
        }
      });
      setReviewStatus(wasEditing ? "Avaliação atualizada." : "Avaliação publicada.");
      await loadReviews();
      await loadActivities();
    } catch (error) {
      setReviewStatus(error.message, true);
      updateReviewSubmitState();
    }
  });
  updateReviewSubmitState();
}

/* ---------- 7. INICIALIZAÇÃO ---------- */
lucide.createIcons(); // transforma os <i data-lucide="..."> do HTML em ícones
buildPanels();
loadActivities();
loadFollowingActivities();
initReviewForm().then(loadReviews);

// Pesquisa o catálogo GameBrain com debounce para reduzir chamadas e consumo da cota.
$("game-search").addEventListener("input", event => {
  searchRequestId++;
  state.query = event.target.value;
  state.page = 0;
  state.remotePage = 1;
  window.clearTimeout(searchTimer);
  state.filters.genre.clear();
  state.filters.platform.clear();
  state.draftFilters.genre.clear();
  state.draftFilters.platform.clear();
  FILTERS.genre.options = [];
  FILTERS.platform.options = [];

  const query = state.query.trim();
  if (query.length < 2) {
    searchRequestId++;
    state.mode = "community";
    state.apiResults = communityGames;
    state.apiTotal = communityTotal;
    $("game-search-status").textContent = query
      ? "Digite pelo menos 2 caracteres para pesquisar no catálogo."
      : "";
    render();
    return;
  }

  state.mode = "search";
  state.apiResults = [];
  state.apiTotal = 0;
  $("game-search-status").textContent = "";
  render();
  searchTimer = window.setTimeout(() => fetchGameBrainResults(query, 1), 1000);
});

$("carousel-prev").addEventListener("click", () => movePage(-1));
$("carousel-next").addEventListener("click", () => movePage(1));
$("clear-filters-empty").addEventListener("click", resetFilters);

// Fecha os painéis de filtro ao clicar fora ou apertar Esc
document.addEventListener("click", event => { if (!event.target.closest(".filter-menu-wrap")) closePanels(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closePanels(); });

render();
loadCommunityGames();
