function showFormError(message) {
  const errorBox = document.getElementById("form-error");
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideFormError() {
  const errorBox = document.getElementById("form-error");
  if (!errorBox) return;
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

function setLoading(button, isLoading, labelDefault, labelLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? labelLoading : labelDefault;
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError();
    const button = document.getElementById("submit-btn");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    setLoading(button, true, "تسجيل الدخول", "جاري تسجيل الدخول...");
    try {
      await Api.login({ email, password });
      window.location.href = "/index.html";
    } catch (err) {
      showFormError(err.message);
      setLoading(button, false, "تسجيل الدخول", "جاري تسجيل الدخول...");
    }
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError();
    const button = document.getElementById("submit-btn");
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      showFormError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(button, true, "إنشاء الحساب", "جاري إنشاء الحساب...");
    try {
      await Api.register({ name, email, password });
      window.location.href = "/index.html";
    } catch (err) {
      showFormError(err.message);
      setLoading(button, false, "إنشاء الحساب", "جاري إنشاء الحساب...");
    }
  });
}
