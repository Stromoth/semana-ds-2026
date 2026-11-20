"use strict";

(() => {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");
  if (!header || !footer) return;

  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const isHome = currentPath === "/" || currentPath === "/index.html";
  const pages = [
    { href: "/", label: "JOGOS", path: "/" },
    { href: "/pages/listas.html", label: "LISTAS", path: "/pages/listas.html" },
    { href: "/pages/jogadores.html", label: "JOGADORES", path: "/pages/jogadores.html" }
  ];

  const navLinks = pages.map(({ href, label, path }) => {
    const active = path === currentPath || (path === "/" && isHome);
    return `<a class="nav-link${active ? " active" : ""}" href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");

  header.innerHTML = `
    <div class="site-width site-header-inner">
      <a class="brand-link" href="/" aria-label="Gamebox — página inicial">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        <span class="brand-name">GAMEBOX</span>
      </a>
      <nav class="site-main-nav" aria-label="Navegação principal">${navLinks}</nav>
      <div class="site-header-actions">
        <a class="nav-link" data-shell-register href="/pages/login.html?mode=register">CRIAR CONTA</a>
        <a class="nav-link" data-shell-login href="/pages/login.html">ENTRAR</a>
        <a class="nav-link${currentPath === "/pages/biblioteca.html" ? " active" : ""}" data-shell-library href="/pages/biblioteca.html" hidden>MINHA BIBLIOTECA</a>
        <a class="nav-link${currentPath === "/pages/perfil.html" ? " active" : ""}" data-shell-profile href="#" hidden>MEU PERFIL</a>
        <button class="nav-link" data-shell-logout type="button" hidden>SAIR</button>
        <span class="account-status" data-shell-status role="status" aria-live="polite"></span>
        ${isHome ? `
          <div class="view-switch" aria-label="Alternar tela">
            <button type="button" data-screen-target="discover" class="selected" aria-label="Tela de descoberta"><span>DESCOBRIR</span></button>
            <button type="button" data-screen-target="feed" aria-label="Tela de avaliações"><span>AVALIAÇÕES</span></button>
          </div>` : ""}
      </div>
    </div>`;

  footer.innerHTML = `
    <div class="site-width site-footer-inner">
      <a class="brand-link" href="/" aria-label="Gamebox — página inicial">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        <span class="brand-name">GAMEBOX</span>
      </a>
      <p class="footer-copy">© 2026 GameBox · Dados de jogos por <a href="https://gamebrain.co/api" target="_blank" rel="noopener noreferrer">GameBrain</a></p>
    </div>`;
})();
