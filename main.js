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

/* Opções dos filtros. ↔ HTML: cada chave corresponde a <div data-filter-panel="chave">
   e ao botão id="filter-chave". */
const OPTIONS = {
  year: ["Qualquer ano", ...[...new Set(GAMES.map(g => String(g.year)))].sort().reverse()],
  rating: ["Qualquer nota", "4 estrelas ou mais", "3 estrelas ou mais", "2 estrelas ou mais", "Sem avaliação"],
  popular: ["Mais populares", "Em alta", "Mais avaliados", "Mais comentados", "Lançamentos recentes"],
  genre: ["Ação", "Aventura", "RPG", "Estratégia", "Corrida", "Terror", "Indie", "Simulação"],
  platform: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
  other: ["Modo single-player", "Multiplayer", "Cooperativo", "Com história", "Jogo curto", "Acesso antecipado"]
};
const MULTI = ["genre", "platform", "other"];                 // permitem marcar várias opções
const RESET = { year: "Qualquer ano", rating: "Qualquer nota" }; // opção que limpa o filtro
const MIN_RATING = { "4 estrelas ou mais": 4, "3 estrelas ou mais": 3, "2 estrelas ou mais": 2 };
const SORTS = { // "Em alta" mantém a ordem original da lista (ranking da semana)
  "Mais populares": (a, b) => b.votes - a.votes,
  "Mais avaliados": (a, b) => (b.rating ?? -1) - (a.rating ?? -1),
  "Mais comentados": (a, b) => b.reviews - a.reviews,
  "Lançamentos recentes": (a, b) => b.year - a.year
};
const PAGE_SIZE = 4; // jogos por página do carrossel

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
const state = { query: "", year: "", rating: "", popular: "", genre: new Set(), platform: new Set(), other: new Set(), page: 0 };
const baseLabel = {}; // texto original de cada botão de filtro (lido do HTML)

function getResults() {
  const q = norm(state.query.trim());
  const list = GAMES.filter(g => {
    if (q && !norm(g.title).includes(q) && !g.genres.some(x => norm(x).includes(q))) return false;
    if (state.year && String(g.year) !== state.year) return false;
    if (state.rating === "Sem avaliação" && g.rating !== null) return false;
    if (MIN_RATING[state.rating] && (g.rating === null || g.rating < MIN_RATING[state.rating])) return false;
    if (state.genre.size && !g.genres.some(x => state.genre.has(x))) return false;
    if (state.platform.size && !g.platforms.some(x => state.platform.has(x))) return false;
    if (state.other.size && !g.features.some(x => state.other.has(x))) return false;
    return true;
  });
  return SORTS[state.popular] ? list.sort(SORTS[state.popular]) : list;
}

// Cria um card. ↔ CSS: .poster-card, .poster-title, .game-meta...
// ↔ HTML/JS: data-screen-target="feed" faz o clique abrir o feed (futuramente: página do jogo)
function makeCard(game) {
  const card = el("button", "poster-card game-card");
  card.type = "button";
  card.dataset.gameId = game.id;
  card.dataset.screenTarget = "feed";
  const image = el("img");
  image.loading = "lazy"; image.src = game.image; image.alt = game.alt;
  const votes = el("span");
  votes.append(el("span", "green", "●"), " " + formatVotes(game.votes));
  const stats = el("span", "game-meta poster-stats");
  stats.append(votes, el("span", "", "★ " + formatRating(game.rating)));
  const body = el("span", "poster-body");
  body.append(el("span", "poster-title", game.title), el("span", "game-meta poster-genre", `${game.genres[0]} • ${game.platformLabel}`), stats);
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
  $("carousel-prev").disabled = $("carousel-next").disabled = pages <= 1;

  // Chips dos filtros ativos (↔ HTML #active-filter-chips)
  const active = [];
  Object.keys(OPTIONS).forEach(type => MULTI.includes(type) ? state[type].forEach(v => active.push([type, v])) : state[type] && active.push([type, state[type]]));
  $("active-filter-chips").replaceChildren(...active.map(([type, value]) => {
    const chip = el("span", "filter-chip", value);
    const remove = makeButton("×", "", () => { MULTI.includes(type) ? state[type].delete(value) : (state[type] = ""); state.page = 0; render(); });
    remove.setAttribute("aria-label", "Remover filtro " + value);
    chip.append(remove);
    return chip;
  }));

  // Contador (↔ HTML #filter-result)
  $("filter-result").textContent = state.query.trim() || active.length ? `${results.length} RESULTADO(S)` : `${results.length} JOGOS EM DESTAQUE`;

  // Texto/estado dos botões de filtro (↔ CSS .filter-button.active)
  Object.keys(OPTIONS).forEach(type => {
    const multi = MULTI.includes(type);
    const count = multi ? state[type].size : 0;
    const trigger = $("filter-" + type);
    trigger.textContent = !multi && state[type] ? state[type] : count ? `${baseLabel[type]} (${count})` : baseLabel[type];
    trigger.classList.toggle("active", multi ? count > 0 : Boolean(state[type]));
  });

  // Marca as opções selecionadas dentro dos painéis (↔ CSS .filter-option.selected)
  document.querySelectorAll(".filter-popover").forEach(panel => {
    const type = panel.dataset.filterPanel;
    if (MULTI.includes(type)) {
      panel.querySelectorAll("input").forEach(box => { box.checked = state[type].has(box.value); box.closest("label").classList.toggle("selected", box.checked); });
    } else {
      panel.querySelectorAll("button.filter-option").forEach(b => b.classList.toggle("selected", state[type] ? state[type] === b.dataset.value : b.dataset.value === RESET[type]));
    }
  });
}

// Constrói as opções de cada painel. ↔ HTML: [data-filter-panel] e #filter-<tipo>
function buildPanels() {
  Object.entries(OPTIONS).forEach(([type, options]) => {
    const panel = document.querySelector(`[data-filter-panel="${type}"]`);
    const trigger = $("filter-" + type);
    baseLabel[type] = trigger.textContent.trim();
    options.forEach(option => {
      if (MULTI.includes(type)) {
        const label = el("label", "filter-option");
        const box = el("input");
        box.type = "checkbox"; box.value = option;
        box.addEventListener("change", () => { box.checked ? state[type].add(option) : state[type].delete(option); state.page = 0; render(); });
        label.append(box, option);
        panel.append(label);
      } else {
        const button = makeButton(option, "filter-option", () => {
          state[type] = option === RESET[type] || state[type] === option ? "" : option; // clicar de novo desmarca
          state.page = 0; closePanels(); render();
        });
        button.dataset.value = option;
        panel.append(button);
      }
    });
    if (MULTI.includes(type)) {
      const actions = el("div", "filter-actions");
      actions.append(makeButton("Limpar", "filter-action", () => { state[type].clear(); state.page = 0; render(); }), makeButton("Aplicar", "filter-action primary", closePanels));
      panel.append(actions);
    }
    trigger.addEventListener("click", () => {
      const opening = panel.hidden;
      closePanels();
      panel.hidden = !opening;
      trigger.setAttribute("aria-expanded", String(opening));
    });
  });
}
function closePanels() {
  document.querySelectorAll(".filter-popover").forEach(panel => { panel.hidden = true; });
  document.querySelectorAll(".filter-menu-wrap > button").forEach(b => b.setAttribute("aria-expanded", "false"));
}
function resetFilters() {
  state.query = ""; state.year = state.rating = state.popular = ""; state.page = 0;
  MULTI.forEach(type => state[type].clear());
  $("game-search").value = "";
  render();
}
function movePage(direction) {
  const pages = Math.max(1, Math.ceil(getResults().length / PAGE_SIZE));
  state.page = (state.page + direction + pages) % pages;
  render();
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

// Busca (↔ HTML #game-search): filtra os cards enquanto digita
$("game-search").addEventListener("input", event => { state.query = event.target.value; state.page = 0; render(); });

$("carousel-prev").addEventListener("click", () => movePage(-1));
$("carousel-next").addEventListener("click", () => movePage(1));
$("clear-filters-empty").addEventListener("click", resetFilters);

// Fecha os painéis de filtro ao clicar fora ou apertar Esc
document.addEventListener("click", event => { if (!event.target.closest(".filter-menu-wrap")) closePanels(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closePanels(); });

render();
