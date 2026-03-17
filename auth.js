(function () {
  "use strict";

  const isConfigured =
    typeof SUPABASE_URL !== "undefined" &&
    typeof SUPABASE_ANON_KEY !== "undefined" &&
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("YOUR_") &&
    !SUPABASE_ANON_KEY.includes("YOUR_");

  const loginEl = document.getElementById("auth-screen");
  const drumkitEl = document.getElementById("drumkit-screen");

  if (!isConfigured) {
    showSetupRequired();
    return;
  }

  const userEmailEl = document.getElementById("user-email");
  const authErrorEl = document.getElementById("auth-error");
  const signInForm = document.getElementById("signin-form");
  const signUpForm = document.getElementById("signup-form");
  const signInTab = document.getElementById("tab-signin");
  const signUpTab = document.getElementById("tab-signup");
  const signOutBtn = document.getElementById("signout-btn");

  let supabase;
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window._supabaseClient = supabase; // Expose for beats module (shared auth session)
  } catch (err) {
    console.warn("Supabase init failed:", err.message);
    showSetupRequired();
    return;
  }

  function showSetupRequired() {
    loginEl.classList.remove("hidden");
    drumkitEl.classList.add("hidden");
    loginEl.innerHTML = `
      <div class="auth-card">
        <h1 class="auth-title">Beatmaker Login</h1>
        <p class="auth-setup-msg">
          Supabase is not configured yet. See <code>SUPABASE_SETUP.md</code> for setup steps.
        </p>
        <button type="button" class="auth-btn auth-btn-primary" id="guest-continue">
          Continue as guest (no login)
        </button>
      </div>
    `;
    document.getElementById("guest-continue").addEventListener("click", () => {
      loginEl.classList.add("hidden");
      drumkitEl.classList.remove("hidden");
      if (typeof initDrumkit === "function") initDrumkit(null);
    });
  }

  function showError(msg) {
    authErrorEl.textContent = msg || "";
    authErrorEl.classList.toggle("hidden", !msg);
  }

  function switchTab(toSignUp) {
    signInTab.classList.toggle("active", !toSignUp);
    signUpTab.classList.toggle("active", toSignUp);
    signInForm.classList.toggle("hidden", toSignUp);
    signUpForm.classList.toggle("hidden", !toSignUp);
    showError("");
  }

  signInTab.addEventListener("click", () => switchTab(false));
  signUpTab.addEventListener("click", () => switchTab(true));

  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signInForm.querySelector('input[name="email"]').value.trim();
    const password = signInForm.querySelector('input[name="password"]').value;
    showError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      showError(err.message || "Sign in failed.");
    }
  });

  signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signUpForm.querySelector('input[name="email"]').value.trim();
    const password = signUpForm.querySelector('input[name="password"]').value;
    showError("");
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      showError("Check your email to confirm your account.");
    } catch (err) {
      showError(err.message || "Sign up failed.");
    }
  });

  function enterGuestMode() {
    sessionStorage.setItem("beatmaker_guest", "1");
    loginEl.classList.add("hidden");
    drumkitEl.classList.remove("hidden");
    if (userEmailEl) userEmailEl.textContent = "Guest";
    if (typeof initDrumkit === "function") initDrumkit(null);
  }

  function exitGuestMode() {
    sessionStorage.removeItem("beatmaker_guest");
  }

  function isGuest() {
    return sessionStorage.getItem("beatmaker_guest") === "1";
  }

  document.getElementById("guest-continue").addEventListener("click", enterGuestMode);

  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      if (isGuest()) {
        exitGuestMode();
        loginEl.classList.remove("hidden");
        drumkitEl.classList.add("hidden");
        switchTab(false);
      } else {
        supabase.auth.signOut();
      }
    });
  }

  supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    if (user) {
      exitGuestMode();
      loginEl.classList.add("hidden");
      drumkitEl.classList.remove("hidden");
      if (userEmailEl) userEmailEl.textContent = user.email;
      if (typeof initDrumkit === "function") initDrumkit(user);
    } else if (isGuest()) {
      loginEl.classList.add("hidden");
      drumkitEl.classList.remove("hidden");
      if (userEmailEl) userEmailEl.textContent = "Guest";
      if (typeof initDrumkit === "function") initDrumkit(null);
    } else {
      loginEl.classList.remove("hidden");
      drumkitEl.classList.add("hidden");
      switchTab(false);
    }
  });
})();
