"use strict";

(() => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const status = document.getElementById("auth-status");
  const title = document.getElementById("auth-title");
  const intro = document.getElementById("auth-intro");
  const tabs = [...document.querySelectorAll("[data-auth-mode]")];

  function setMode(mode) {
    const registering = mode === "register";
    loginForm.hidden = registering;
    registerForm.hidden = !registering;
    title.textContent = registering ? "CRIAR CONTA" : "ENTRAR";
    intro.textContent = registering
      ? "Crie sua conta para começar a organizar seus jogos."
      : "Acesse sua conta para cuidar da sua biblioteca.";
    status.textContent = "";
    status.classList.remove("error");
    tabs.forEach((tab) => {
      const selected = tab.dataset.authMode === mode;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-pressed", String(selected));
    });
  }

  async function submitForm(form, action) {
    const submit = form.querySelector('button[type="submit"]');
    status.textContent = "";
    status.classList.remove("error");
    submit.disabled = true;

    try {
      await action();
      window.location.assign("/pages/biblioteca.html");
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("error");
      submit.disabled = false;
    }
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authMode)));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    const formData = new FormData(loginForm);
    submitForm(loginForm, () => window.GameboxApi.login({
      email: formData.get("email"),
      senha: formData.get("senha")
    }));
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!registerForm.reportValidity()) return;

    const formData = new FormData(registerForm);
    submitForm(registerForm, () => window.GameboxApi.register({
      nome: formData.get("nome"),
      email: formData.get("email"),
      senha: formData.get("senha")
    }));
  });

  const initialMode = new URLSearchParams(window.location.search).get("mode");
  setMode(initialMode === "register" ? "register" : "login");

  window.GameboxApi.currentUser()
    .then(() => window.location.replace("/pages/biblioteca.html"))
    .catch((error) => {
      if (error.status !== 401) {
        status.textContent = error.message;
        status.classList.add("error");
      }
    });
})();