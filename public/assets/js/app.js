async function loadProfile() {
  try {
    const res = await Api.me();
    const user = res.data.user;

    document.getElementById("user-name").textContent = user.name;
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("api-key").textContent = user.apiKey;

    const status = document.getElementById("verify-status");
    if (user.isVerified) {
      status.textContent = "موثّق";
      status.classList.add("text-[var(--teal)]");
    } else {
      status.textContent = "غير موثّق";
      status.classList.add("text-[var(--gold)]");
    }

    document.getElementById("loading-state").classList.add("hidden");
    document.getElementById("dashboard-content").classList.remove("hidden");
  } catch (err) {
    window.location.href = "/login.html";
  }
}

const copyBtn = document.getElementById("copy-key-btn");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const key = document.getElementById("api-key").textContent;
    await navigator.clipboard.writeText(key);
    copyBtn.textContent = "تم النسخ ✓";
    setTimeout(() => (copyBtn.textContent = "نسخ المفتاح"), 1800);
  });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await Api.logout();
    window.location.href = "/login.html";
  });
}

loadProfile();
