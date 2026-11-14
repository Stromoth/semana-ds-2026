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

/* ---------- 1. DADOS ----------
   Hoje os jogos vivem nesta lista. Quando houver banco de dados, basta
   substituir GAMES pelo resultado de um fetch("/api/jogos") — o resto
   do código lê tudo daqui. (Dados de demonstração.) */
const pexels = (id, width = 800) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

const GAMES = [
  { id: 1, title: "Neon Divide", year: 2026, genres: ["Ação", "Aventura"], platforms: ["PC", "PlayStation", "Xbox"], platformLabel: "PC / Console", rating: 4.6, votes: 28000, reviews: 1240, features: ["Modo single-player", "Com história"], image: pexels(17195067), alt: "Beco urbano vibrante iluminado por luzes neon" },
  { id: 2, title: "Ashfall Protocol", year: 2025, genres: ["Sobrevivência", "Terror"], platforms: ["PC"], platformLabel: "PC", rating: 4.3, votes: 19000, reviews: 860, features: ["Modo single-player", "Cooperativo"], image: pexels(8079178), alt: "Explosão de fogo em cenário noturno dramático" },
  { id: 3, title: "Skyforge Zero", year: 2026, genres: ["RPG", "Aventura"], platforms: ["PlayStation", "Xbox"], platformLabel: "Console", rating: 4.7, votes: 25000, reviews: 1010, features: ["Modo single-player", "Com história"], image: pexels(7672020), alt: "Astronauta operando painel em nave espacial com luz azul" },
  { id: 4, title: "Driftline", year: 2025, genres: ["Corrida"], platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"], platformLabel: "Multiplataforma", rating: 4.2, votes: 12000, reviews: 540, features: ["Multiplayer"], image: pexels(18833268), alt: "Carro amarelo em rua molhada durante a noite" },
  { id: 5, title: "Umbra Vault", year: 2024, genres: ["Estratégia"], platforms: ["PC"], platformLabel: "PC", rating: 4.0, votes: 9000, reviews: 310, features: ["Modo single-player", "Multiplayer"], image: pexels(1224859), alt: "Corredor abandonado com grafites" },
  { id: 6, title: "Tideborn", year: 2025, genres: ["Aventura", "Indie"], platforms: ["PlayStation", "Xbox", "Nintendo Switch"], platformLabel: "Console", rating: 4.4, votes: 15000, reviews: 620, features: ["Modo single-player", "Com história"], image: pexels(9314016), alt: "Ondas intensas sob céu de tempestade" },
  { id: 7, title: "Verdant Echo", year: 2024, genres: ["Exploração", "Indie"], platforms: ["PC"], platformLabel: "PC", rating: 3.8, votes: 6000, reviews: 190, features: ["Modo single-player", "Jogo curto"], image: pexels(16310035), alt: "Silhueta em floresta escura com contraluz" },
  { id: 8, title: "Iron Circuit", year: 2026, genres: ["Ação"], platforms: ["PC"], platformLabel: "Arcade", rating: null, votes: 800, reviews: 0, features: ["Multiplayer", "Acesso antecipado"], image: pexels(28833650), alt: "Figura com capacete em cenário escuro" }
];

/* Avaliações de exemplo (gameId = id em GAMES), da mais recente para a mais antiga.
   Futuramente virão do banco de dados. */
const REVIEWS = [
  { gameId: 1, author: "daniel.aurora", platform: "PC", rating: 4, likes: 128, text: "A exploração recompensa cada desvio do caminho principal. As zonas neon parecem esconder uma nova história em cada esquina." },
  { gameId: 2, author: "clara.pixel", platform: "PC", rating: 5, likes: 96, text: "Um sistema de combate preciso, com uma trilha sonora memorável. Cada confronto encontra uma forma nova de elevar a tensão." },
  { gameId: 3, author: "tomaz.ctrl", platform: "PlayStation", rating: 3, likes: 71, text: "A sensação de pilotar entre ruínas orbitais é incrível. O ritmo inicial é lento, mas a descoberta compensa cada minuto." },
  { gameId: 4, author: "lucas.drift", platform: "Xbox", rating: 4, likes: 54, text: "A física dos carros é um prazer de dominar. As pistas molhadas exigem precisão, e cada derrapagem bem executada dá uma satisfação enorme." },
  { gameId: 6, author: "mari.ondas", platform: "Nintendo Switch", rating: 5, likes: 112, text: "Uma aventura pequena e linda. O mar muda a cada capítulo e a trilha acompanha cada maré. Fácil de recomendar para qualquer pessoa." },
  { gameId: 5, author: "helena.tactics", platform: "PC", rating: 4, likes: 38, text: "Estratégia densa, mas que ensina com paciência. Planejar a invasão do cofre antes de agir é viciante, só faltou um pouco mais de variedade de mapas." },
  { gameId: 1, author: "bia.combo", platform: "PlayStation", rating: 5, likes: 84, text: "Os combos encaixam de um jeito muito fluido, e as cidades neon deixam cada luta ainda mais bonita. Já passei das 40 horas." },
  { gameId: 7, author: "joao.sombra", platform: "PC", rating: 4, likes: 29, text: "Curto e contemplativo. Dá para terminar em uma tarde, mas as paisagens e os sons da floresta ficam na cabeça por dias." },
  { gameId: 3, author: "rafael.quest", platform: "Xbox", rating: 5, likes: 66, text: "O melhor RPG espacial que joguei em anos. As escolhas realmente mudam a tripulação, e o final me pegou de surpresa." },
  { gameId: 2, author: "vinilbyte", platform: "PC", rating: 4, likes: 41, text: "Sobreviver com poucos recursos gera uma tensão constante. Jogar em cooperativo deixa tudo mais divertido, e mais caótico também." },
  { gameId: 8, author: "pedro.volt", platform: "PC", rating: 3, likes: 9, text: "Promissor, mas ainda é acesso antecipado: faltam modos e o equilíbrio das partidas oscila. A base é ótima e vale acompanhar as atualizações." }
];

/* Os valores dos filtros são fornecidos pela GameBrain para cada busca. */
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
const norm = text => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // busca sem acento
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
  apiResults: null,
  apiTotal: 0
};
let searchTimer;
let searchRequestId = 0;

function getResults() {
  const q = norm(state.query.trim());
  const source = state.apiResults === null ? GAMES : state.apiResults;
  return source.filter(g =>
    state.apiResults !== null ||
    !q ||
    norm(g.title).includes(q) ||
    g.genres.some(x => norm(x).includes(q))
  );
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
    reviews: 0,
    features: [...(game.tags || []), ...(game.modos || [])],
    image: game.capa_url,
    alt: `Capa de ${game.titulo}`
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
  votes.append(el("span", "green", "●"), " " + formatVotes(game.votes));
  const stats = el("span", "game-meta poster-stats");
  stats.append(votes, el("span", "", "★ " + formatRating(game.rating)));
  const body = el("span", "poster-body");
  const title = game.gamebrain_id ? el("a", "poster-title", game.title) : el("span", "poster-title", game.title);
  if (game.gamebrain_id) title.href = `/pages/jogo.html?id=${encodeURIComponent(game.gamebrain_id)}`;
  const genreLabel = game.genres[0] || "Gênero não informado";
  body.append(title, el("span", "game-meta poster-genre", `${genreLabel} • ${game.platformLabel}`), stats);
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
  if (state.apiResults !== null) {
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

  const resultCount = state.apiResults !== null ? state.apiTotal : results.length;
  $("filter-result").textContent = state.query.trim() || active.length
    ? `${resultCount} RESULTADO(S)`
    : `${results.length} JOGOS EM DESTAQUE`;
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
    trigger.disabled = options.length === 0 || state.apiResults === null;
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
  state.apiResults = null;
  state.apiTotal = 0;
  searchRequestId++;
  window.clearTimeout(searchTimer);
  $("game-search-status").textContent = "";
  $("game-search").value = "";
  render();
}
function movePage(direction) {
  if (state.apiResults !== null) {
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

/* ---------- 5. CURTIDAS ----------
   ↔ HTML: botões .like-button (com <span> contendo o número). Delegação: vale
   também para avaliações criadas depois pelo formulário. */
document.addEventListener("click", event => {
  const button = event.target.closest(".like-button");
  if (!button) return;
  const count = button.querySelector("span");
  const liked = button.classList.toggle("liked"); // ↔ CSS .like-button.liked
  button.setAttribute("aria-pressed", String(liked));
  count.textContent = String(Math.max(0, Number(count.textContent) + (liked ? 1 : -1)));
});

/* ---------- 6. FORMULÁRIO DE AVALIAÇÃO ----------
   ↔ HTML: #comment-form, #comment-game, #comment-platform, #comment-input,
   #publish-button, #comment-status, #review-list e .rating-picker button */
function buildReview(game, platform, rating, text, author = "jogador demonstrativo", likes = 0) {
  const review = el("article", "review-card demo-review"); // ↔ CSS .review-card
  review.innerHTML = `<div class="review-art"></div><div><div class="flex flex-wrap justify-between gap-3"><div><h2 class="review-heading"></h2><p class="review-meta mt-1"></p></div><span class="stars" aria-label="${rating} de 5 estrelas">${"★".repeat(rating)}<span class="empty-star">${"★".repeat(5 - rating)}</span></span></div><p class="review-copy mt-3"></p><button class="like-button mt-3" type="button" aria-pressed="false"><i data-lucide="heart" class="inline-block align-text-bottom" width="13" height="13"></i> <span>${likes}</span> curtidas</button></div>`;
  const poster = el("img", "review-poster");
  poster.src = game.image; poster.alt = game.alt;
  review.querySelector(".review-art").replaceWith(poster);
  // Textos digitados pelo usuário entram via textContent (seguro contra HTML injetado)
  review.querySelector(".review-heading").textContent = `${game.title} · ${game.year}`;
  review.querySelector(".review-meta").textContent = `por ${author} · ${platform}`;
  review.querySelector(".review-copy").textContent = text;
  return review;
}

// Preenche #review-list (↔ HTML) com as avaliações da lista REVIEWS
function renderReviews() {
  $("review-list").append(...REVIEWS.map(r => buildReview(GAMES.find(g => g.id === r.gameId), r.platform, r.rating, r.text, r.author, r.likes)));
}

function initReviewForm() {
  const gameSelect = $("comment-game"), platformSelect = $("comment-platform"), input = $("comment-input");
  const status = $("comment-status"), publishButton = $("publish-button");
  const starButtons = [...document.querySelectorAll(".rating-picker button")];
  let score = 0;

  GAMES.forEach(game => gameSelect.append(new Option(game.title, game.title))); // mesma lista dos cards

  const updatePublishState = () => { publishButton.disabled = !(gameSelect.value && platformSelect.value && score && input.value.trim()); };
  const resetStars = () => starButtons.forEach(b => { b.classList.remove("selected"); b.setAttribute("aria-pressed", "false"); });
  [gameSelect, platformSelect, input].forEach(control => control.addEventListener("input", updatePublishState));
  starButtons.forEach(star => star.addEventListener("click", () => {
    score = Number(star.dataset.score);
    starButtons.forEach(b => { b.classList.toggle("selected", Number(b.dataset.score) <= score); b.setAttribute("aria-pressed", String(Number(b.dataset.score) === score)); }); // ↔ CSS .rating-picker button.selected
    updatePublishState();
  }));

  $("comment-form").addEventListener("submit", event => {
    event.preventDefault();
    const game = GAMES.find(g => g.title === gameSelect.value);
    const text = input.value.trim();
    if (!game || !platformSelect.value || !score || !text) { status.textContent = "Escolha jogo, plataforma, nota e escreva um comentário."; return; }
    $("review-list").prepend(buildReview(game, platformSelect.value, score, text));
    $("review-list").scrollTop = 0; // mostra a avaliação nova no topo da lista rolável
    lucide.createIcons(); // desenha o ícone de coração da nova avaliação
    input.value = gameSelect.value = platformSelect.value = "";
    score = 0; resetStars();
    updatePublishState(); // corrige: o botão volta a ficar desabilitado após publicar
    status.textContent = "Comentário publicado nesta demonstração.";
  });
  updatePublishState();
}

/* ---------- 7. INICIALIZAÇÃO ---------- */
renderReviews(); // cria as avaliações antes dos ícones, para os corações aparecerem
lucide.createIcons(); // transforma os <i data-lucide="..."> do HTML em ícones
buildPanels();
initReviewForm();

// Busca os jogos reais com debounce para reduzir chamadas e consumo da cota da API.
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
    state.apiResults = null;
    state.apiTotal = 0;
    $("game-search-status").textContent = query
      ? "Digite pelo menos 2 caracteres para pesquisar no catálogo."
      : "";
    render();
    return;
  }

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
