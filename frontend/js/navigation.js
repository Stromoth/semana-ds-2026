"use strict";

(() => {
  const loginLink = document.querySelector("[data-shell-login]");
  const libraryLink = document.querySelector("[data-shell-library]");
  const profileLink = document.querySelector("[data-shell-profile]");
  const logoutButton = document.querySelector("[data-shell-logout]");
  const registerLink = document.querySelector("[data-shell-register]");
  const status = document.querySelector("[data-shell-status]");

  if (!loginLink || !libraryLink || !profileLink || !logoutButton || !registerLink || !status || !window.GameboxApi) return;

  function showSignedInState(user) {
    loginLink.hidden = Boolean(user);
    registerLink.hidden = Boolean(user);
    libraryLink.hidden = !user;
    profileLink.hidden = !user;
    logoutButton.hidden = !user;
    if (user) {
      profileLink.href = `/pages/perfil.html?id=${encodeURIComponent(user.id)}`;
      if (window.location.pathname === "/pages/biblioteca.html") libraryLink.setAttribute("aria-current", "page");
      if (window.location.pathname === "/pages/perfil.html") profileLink.setAttribute("aria-current", "page");
    }
  }

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    status.textContent = "";
    try {
      await window.GameboxApi.logout();
      window.location.assign("/");
    } catch (error) {
      logoutButton.disabled = false;
      status.textContent = error.message;
    }
  });

  window.GameboxApi.currentUser()
    .then(({ usuario }) => showSignedInState(usuario))
    .catch((error) => {
      if (error.status === 401) {
        showSignedInState(null);
        return;
      }
      status.textContent = error.message;
    });
})();
