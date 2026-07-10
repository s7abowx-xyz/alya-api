const API_KEY_STORAGE = "alya_api_key";

function getSavedApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

const apiKeyInput = document.getElementById("api-key-input");
apiKeyInput.value = getSavedApiKey();

document.getElementById("save-key-btn").addEventListener("click", () => {
  localStorage.setItem(API_KEY_STORAGE, apiKeyInput.value.trim());
  const btn = document.getElementById("save-key-btn");
  const original = btn.textContent;
  btn.textContent = "تم الحفظ ✓";
  setTimeout(() => (btn.textContent = original), 1500);
});

const CATEGORY_LABELS = {
  tools: "أدوات",
  text: "نصوص",
  downloads: "تحميل",
};

function categoryLabel(name) {
  return CATEGORY_LABELS[name] || name;
}

function methodBadgeClass(method) {
  return method === "GET"
    ? "bg-teal/15 text-teal border-teal/30"
    : "bg-gold/15 text-gold border-gold/30";
}

function buildModuleCard(mod) {
  const wrapper = document.createElement("div");
  wrapper.className = "card-surface rounded-xl p-5";

  const needsBody = mod.method !== "GET";
  const bodyId = `body-${mod.path.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const outputId = `out-${mod.path.replace(/[^a-zA-Z0-9]/g, "-")}`;

  wrapper.innerHTML = `
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono px-2 py-0.5 rounded border ${methodBadgeClass(mod.method)}">${mod.method}</span>
          <h3 class="font-display font-bold text-white text-sm">${mod.name}</h3>
          ${mod.public ? '<span class="text-xs px-2 py-0.5 rounded border border-[var(--border-line)]" style="color:var(--text-muted)">عام</span>' : ""}
        </div>
        <p class="text-sm mt-1" style="color:var(--text-muted)">${mod.description}</p>
        <code class="text-xs font-mono block mt-2" style="color:var(--text-muted)">${mod.path}</code>
      </div>
      <button class="try-btn btn-primary rounded-lg px-4 py-2 text-xs whitespace-nowrap">تجربة الآن</button>
    </div>
    ${
      needsBody
        ? `<textarea id="${bodyId}" rows="3" class="input-field w-full rounded-lg px-4 py-2.5 text-xs font-mono mt-4" placeholder='{"text": "مثال"}'></textarea>`
        : ""
    }
    <pre id="${outputId}" class="hidden mt-4 rounded-lg bg-panel border border-[var(--border-line)] px-4 py-3 text-xs font-mono overflow-x-auto scrollbar-thin" style="color:var(--text-muted)"></pre>
  `;

  const tryBtn = wrapper.querySelector(".try-btn");
  tryBtn.addEventListener("click", async () => {
    const output = document.getElementById(outputId);
    output.classList.remove("hidden");
    output.textContent = "جاري التنفيذ...";

    const options = {
      method: mod.method,
      headers: {},
    };

    const apiKey = getSavedApiKey();
    if (!mod.public) {
      if (!apiKey) {
        output.textContent = "الرجاء إدخال مفتاح API أولًا في الحقل بالأعلى";
        return;
      }
      options.headers["x-api-key"] = apiKey;
    }

    if (needsBody) {
      const raw = document.getElementById(bodyId).value.trim() || "{}";
      try {
        JSON.parse(raw);
      } catch {
        output.textContent = "الجسم (body) ليس JSON صالحًا";
        return;
      }
      options.headers["Content-Type"] = "application/json";
      options.body = raw;
    }

    try {
      const res = await fetch(mod.path, options);
      const data = await res.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = `خطأ في الاتصال: ${err.message}`;
    }
  });

  return wrapper;
}

async function loadCategories() {
  try {
    const res = await fetch("/api/modules/");
    const json = await res.json();
    const grouped = json.data || {};

    const container = document.getElementById("categories-container");
    container.innerHTML = "";

    const categoryNames = Object.keys(grouped);
    if (categoryNames.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted)">لا توجد أقسام مسجّلة بعد. أضف مجلدًا داخل src/modules لإنشاء قسم جديد.</p>`;
    }

    for (const category of categoryNames) {
      const section = document.createElement("section");
      section.innerHTML = `
        <h2 class="font-display text-lg font-bold text-white flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-teal"></span>
          قسم ${categoryLabel(category)}
        </h2>
      `;
      const grid = document.createElement("div");
      grid.className = "grid md:grid-cols-2 gap-4 mt-4";

      for (const mod of grouped[category]) {
        grid.appendChild(buildModuleCard(mod));
      }

      section.appendChild(grid);
      container.appendChild(section);
    }

    document.getElementById("loading-state").classList.add("hidden");
    container.classList.remove("hidden");
  } catch (err) {
    document.getElementById("loading-state").innerHTML =
      `<p class="text-sm text-red-300">تعذّر تحميل الأقسام: ${err.message}</p>`;
  }
}

loadCategories();
