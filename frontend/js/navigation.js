"use strict";

(() => {
  const loginLink = document.querySelector("[data-account-login]");
  const libraryLink = document.querySelector("[data-account-library]");
  const logoutButton = document.querySelector("[data-account-logout]");
  const registerLink = document.querySelector(".account-register");
  const accountStatus = document.querySelector("[data-account-status]");

  if (!loginLink || !libraryLink || !logoutButton || !registerLink || !accountStatus || !window.GameboxApi) return;

  function showSignedInState(signedIn) {
    loginLink.hidden = signedIn;
    registerLink.hidden = signedIn;
    libraryLink.hidden = !signedIn;
    logoutButton.hidden = !signedIn;
  }

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
      await window.GameboxApi.logout();
      window.location.assign("/");
    } catch (error) {
      logoutButton.disabled = false;
      window.alert(error.message);
    }
  });

  window.GameboxApi.currentUser()
    .then(() => showSignedInState(true))
    .catch((error) => {
      if (error.status === 401) {
        showSignedInState(false);
        return;
      }
      accountStatus.textContent = error.message;
    });
})();
