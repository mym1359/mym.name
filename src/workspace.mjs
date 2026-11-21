import { ui } from "./workspace-copy.mjs";
import { previewData } from "./preview-data.mjs";
const root = document.querySelector("#workspace"),
  lang = document.documentElement.lang,
  t = ui[lang];
const adminPage = document.body.dataset.route === "admin",
  locale = lang === "fa" ? "fa-IR" : "en-US",
  base = lang === "fa" ? "/fa/" : "/";
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const date = (s) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(s));
const num = (n) => Number(n).toLocaleString(locale),
  $ = (s) => root.querySelector(s);
const options = (items, selected) =>
  Object.entries(items)
    .map(
      ([k, v]) =>
        `<option value="${escape(k)}" ${selected === k ? "selected" : ""}>${escape(v)}</option>`,
    )
    .join("");
const statusLabels = { open: t.open, active: t.active, closed: t.closed };
const pageNames =
  lang === "fa"
    ? {
        home: "خانه",
        work: "پروژه‌ها",
        "work/darj": "درج",
        "work/sepam": "سپام",
        "work/initiative": "طرح آمریکا",
        about: "درباره من",
        expertise: "خدمات",
        privacy: "حریم خصوصی",
      }
    : {
        home: "Home",
        work: "Projects",
        "work/darj": "Darj",
        "work/sepam": "Sepam",
        "work/initiative": "U.S. initiative",
        about: "About",
        expertise: "Expertise",
        privacy: "Privacy",
      };
let rpc,
  client,
  admin = false,
  demo = false,
  userEmail = "",
  epoch = 0,
  threadEpoch = 0;
let filter = "",
  search = "",
  page = 0,
  selected = null,
  rows = [],
  hasNext = false,
  earliest = null,
  threadMessages = [],
  formKey = null,
  replyKey = null,
  composer = false;
const messageFor = (e) =>
  e?.message?.includes("request_limit")
    ? t.slow
    : e?.message?.includes("thread_closed")
      ? t.ended
      : t.failure;
const notify = (s) => {
  const el = $("#app-note") || $("#login-note");
  if (el) {
    el.textContent = s;
    el.hidden = !s;
  }
};
async function busy(button, fn) {
  if (button.disabled) return;
  button.disabled = true;
  try {
    await fn();
  } catch (e) {
    notify(messageFor(e));
  } finally {
    if (button.isConnected) button.disabled = false;
  }
}
function summary(m) {
  const cards = [
    [t.accounts, m.accounts],
    [t.total, m.requests],
    [t.pending, m.open],
    [t.views, m.views],
  ];
  const max = Math.max(1, ...m.days.map((d) => d.views));
  return `<div class="stat-grid">${cards.map(([s, n]) => `<div class="stat-card"><span>${s}</span><strong>${num(n)}</strong></div>`).join("")}</div><details class="panel data-summary" open><summary><b>${t.traffic}</b> · ${t.daysRange}</summary><div class="stats-pair"><div><h3>${t.daily}</h3><div class="mini-chart" aria-hidden="true">${m.days.map((d) => `<svg viewBox="0 0 10 100" preserveAspectRatio="none"><rect x="0" y="${100 - (100 * d.views) / max}" width="9" height="${(100 * d.views) / max}"/></svg>`).join("")}</div><details class="counts"><summary>${t.trendDetail}</summary><table><thead><tr><th>${t.date}</th><th>${t.viewLabel}</th></tr></thead><tbody>${m.days.map((d) => `<tr><td>${date(d.day + "T12:00:00Z")}</td><td>${num(d.views)}</td></tr>`).join("")}</tbody></table></details><p class="mini">${t.dataHint}</p></div><div><h3>${t.popular}</h3>${m.pages.length ? m.pages.map((p) => `<div class="bar-row"><span>${escape(pageNames[p.page] || p.page)}</span><meter min="0" max="${Math.max(1, m.pages[0].views)}" value="${Number(p.views)}"></meter><b>${num(p.views)}</b></div>`).join("") : `<p>${t.emptyStats}</p>`}<p class="mini">${t.lang} · ${t.english} ${num(m.en)} / ${t.persian} ${num(m.fa)}</p><p class="mini">${t.statusMix} · ${t.open} ${num(m.open)} / ${t.active} ${num(m.active)} / ${t.closed} ${num(m.closed)}</p></div></div></details>`;
}
function compose() {
  return `<section class="panel" id="compose"><h2>${t.compose}</h2><form class="stack" id="new-form"><label>${t.topic}<select name="topic" required><option value="">${t.chooseTopic}</option>${options(t.topics, "")}</select></label><label>${t.subject}<input name="subject" required minlength="3" maxlength="160" dir="auto"></label><label>${t.message}<textarea name="body" required maxlength="5000" dir="auto"></textarea></label><p class="mini">${t.safe}</p><div class="form-actions"><button class="btn primary">${t.send}</button><button type="button" class="btn outline" data-act="cancel">${t.cancel}</button></div></form></section>`;
}
function inbox() {
  return `<section class="panel"><h2>${t.requests}</h2><form id="search-form" class="toolbar"><label>${t.filter}<select name="status">${options({ "": t.all, ...statusLabels }, filter)}</select></label><label>${t.search}<input type="search" name="search" maxlength="160" placeholder="${t.searchHint}" value="${escape(search)}"></label><button class="status-btn">${t.apply}</button></form><div>${rows.map((r) => `<button class="request-row" data-id="${escape(r.id)}" aria-current="${selected?.id === r.id}"><strong>${escape(r.subject)}</strong><span class="row-head"><span class="badge ${r.status}">${t[r.status]}</span><time>${date(r.updated_at)}</time></span>${adminPage ? `<span class="mini">${escape(r.client_email)}</span>` : ""}</button>`).join("") || `<p class="empty">${!filter && !search && !adminPage ? t.empty : t.none}</p>`}</div><div class="pager"><button data-act="prev" ${page ? "" : "disabled"}>${t.previous}</button><span>${t.page} ${num(page + 1)}</span><button data-act="next" ${hasNext ? "" : "disabled"}>${t.next}</button></div></section>`;
}
function thread() {
  if (!selected) return `<h2>${t.history}</h2><p>${t.choose}</p>`;
  return `<div class="row-head"><span>${t.topics[selected.topic]}</span><span class="badge ${selected.status}">${t[selected.status]}</span></div><h3>${escape(selected.subject)}</h3>${adminPage ? `<p class="mini">${escape(selected.client_email)}</p><form class="toolbar change-status" id="status-form"><label>${t.filter}<select name="status">${options(statusLabels, selected.status)}</select></label><button class="status-btn">${t.change}</button></form>` : ""}${earliest !== null ? `<button class="link-button" data-act="older">${t.older}</button>` : ""}${threadMessages.map((m) => `<article class="msg ${m.advisor ? "advisor" : ""}"><div class="row-head"><b>${m.advisor ? t.advisor : t.customer}</b><time>${date(m.created_at)}</time></div><p dir="auto">${escape(m.body)}</p></article>`).join("")}${selected.status === "closed" ? `<p class="notice">${t.ended}</p>` : `<form id="reply-form" class="stack"><label>${t.replyLabel}<textarea name="body" required maxlength="5000" dir="auto"></textarea></label><div><button class="btn primary">${t.reply}</button></div></form>`}`;
}
async function loadThread(older = false) {
  const revision = ++threadEpoch,
    id = selected?.id;
  if (!id) return;
  const ms = await rpc("thread", {
    p_request: id,
    p_before: older ? earliest : null,
  });
  if (revision !== threadEpoch || selected?.id !== id) return;
  const slice = ms.slice(0, 30).reverse();
  earliest = ms.length > 30 ? slice[0].seq : null;
  threadMessages = older ? [...slice, ...threadMessages] : slice;
  $("#thread").innerHTML = thread();
}
async function draw() {
  const rev = ++epoch;
  ++threadEpoch;
  const [list, stats] = await Promise.all([
    rpc("list_requests", {
      p_status: filter,
      p_search: search,
      p_offset: page * 15,
      p_own_only: !adminPage,
    }),
    adminPage ? rpc("metrics") : null,
  ]);
  if (rev !== epoch) return;
  rows = list.slice(0, 15);
  hasNext = list.length > 15;
  selected = rows.find((r) => r.id === selected?.id) || rows[0] || null;
  root.innerHTML = `${demo ? `<p class="preview-note">${t.preview}</p>` : ""}<div class="workspace-head"><div><h2>${adminPage ? t.admin : t.client}</h2>${!demo ? `<p>${t.signed} <bdi>${escape(userEmail)}</bdi></p>` : ""}</div><div class="form-actions">${!adminPage ? `<button class="btn primary" data-act="new">${t.compose}</button>` : ""}${admin && !adminPage && !demo ? `<a class="btn outline" href="${base}admin/">${t.dashboardLink}</a>` : ""}<button class="btn outline" data-act="refresh">${t.refresh}</button><button class="link-button" data-act="exit">${demo ? t.exit : t.logout}</button></div></div><p class="status-line" id="app-note" role="status"></p>${stats ? summary(stats) : ""}<div id="composer">${composer ? compose() : ""}</div><div class="inbox">${inbox()}<section class="panel thread" id="thread" aria-live="polite">${selected ? t.loading : thread()}</section></div>`;
  if (selected) await loadThread();
}
async function boot() {
  if (adminPage && !admin) {
    root.innerHTML = `<div class="panel"><p>${t.denied}</p><div class="form-actions"><a class="btn primary" href="${base}portal/">${t.clientLink}</a><button class="link-button" data-act="exit">${t.logout}</button></div><p id="app-note" role="status"></p></div>`;
    return;
  }
  composer =
    !adminPage && new URLSearchParams(location.search).get("new") === "1";
  try {
    await draw();
  } catch {
    root.innerHTML = `<div class="panel"><p id="app-note" role="status">${t.loadFailure}</p><button class="btn outline" data-act="refresh">${t.retry}</button><button class="btn outline" data-act="exit">${t.logout}</button></div>`;
  }
}
root.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  if (button.dataset.preview) {
    demo = true;
    admin = button.dataset.preview === "admin";
    rpc = previewData(t, admin);
    await boot();
    return;
  }
  if (button.dataset.id) {
    const next = rows.find((r) => r.id === button.dataset.id);
    if (!next) return;
    selected = next;
    replyKey = null;
    threadMessages = [];
    earliest = null;
    root
      .querySelectorAll("[data-id]")
      .forEach((el) => el.setAttribute("aria-current", String(el === button)));
    $("#thread").textContent = t.loading;
    try {
      await loadThread();
    } catch (e) {
      notify(messageFor(e));
    }
    return;
  }
  const op = button.dataset.act;
  if (!op) return;
  await busy(button, async () => {
    if (op === "exit") {
      if (!demo) {
        const { error } = await client.auth.signOut({ scope: "local" });
        if (error) throw error;
      }
      location.replace(location.pathname);
      return;
    }
    if (op === "new" || op === "cancel") {
      composer = op === "new";
      formKey = null;
      $("#composer").innerHTML = composer ? compose() : "";
      if (composer) {
        $("#new-form select").focus();
      }
      return;
    }
    if (op === "older") {
      await loadThread(true);
      return;
    }
    if (op === "prev") page = Math.max(0, page - 1);
    if (op === "next") page++;
    await draw();
  });
});
root.addEventListener("submit", async (e) => {
  const f = e.target;
  e.preventDefault();
  if (f.id === "email-login") return;
  const v = Object.fromEntries(new FormData(f)),
    button = f.querySelector("button[type=submit],button:not([type])");
  await busy(button, async () => {
    if (f.id === "search-form") {
      filter = v.status;
      search = v.search.trim();
      page = 0;
      await draw();
      return;
    }
    if (f.id === "new-form") {
      if (v.subject.trim().length < 3 || !v.body.trim()) {
        notify(t.failure);
        return;
      }
      formKey ??= crypto.randomUUID();
      const id = await rpc("create_request", {
        p_id: formKey,
        p_topic: v.topic,
        p_subject: v.subject.trim(),
        p_body: v.body.trim(),
      });
      formKey = null;
      composer = false;
      filter = "";
      search = "";
      page = 0;
      selected = { id };
    } else if (f.id === "reply-form") {
      if (!v.body.trim()) return;
      replyKey ??= crypto.randomUUID();
      await rpc("reply", {
        p_request: selected.id,
        p_id: replyKey,
        p_body: v.body.trim(),
      });
      replyKey = null;
    } else if (f.id === "status-form")
      await rpc("set_status", { p_request: selected.id, p_status: v.status });
    await draw();
    notify(t.saved);
  });
});
async function connect() {
  const cfg = await fetch("/assets/config.json", { cache: "no-store" }).then(
    (r) => r.json(),
  );
  if (!cfg.url || !cfg.key) return;
  const { createClient } = await import("@supabase/supabase-js");
  client = createClient(cfg.url, cfg.key, {
    auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true },
  });
  const { data, error } = await client.auth.getSession();
  if (
    error ||
    new URLSearchParams(location.search).has("error") ||
    new URLSearchParams(location.hash.slice(1)).has("error")
  )
    notify(t.authFailure);
  let current = data?.session?.user?.id || null;
  client.auth.onAuthStateChange((event, session) => {
    if (
      (event === "SIGNED_OUT" && current) ||
      (event === "SIGNED_IN" && session?.user?.id !== current)
    ) {
      current = session?.user?.id || null;
      location.replace(location.pathname);
    }
  });
  if (data?.session) {
    userEmail = data.session.user.email;
    rpc = async (action, args = {}) => {
      const { data, error } = await client.rpc("mym_" + action, args);
      if (error) throw error;
      return data;
    };
    try {
      admin = await rpc("is_admin");
      await boot();
    } catch {
      notify(t.loadFailure);
    }
    return;
  }
  const returnUrl =
    location.origin +
    location.pathname +
    (new URLSearchParams(location.search).get("new") === "1" ? "?new=1" : "");
  $("#email-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    busy(btn, async () => {
      const { error } = await client.auth.signInWithOtp({
        email: $("#email").value.trim(),
        options: { emailRedirectTo: returnUrl },
      });
      if (error) throw error;
      notify(t.notice);
    });
  });
  $("#google-login").addEventListener("click", (e) =>
    busy(e.currentTarget, async () => {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: returnUrl },
      });
      if (error) throw error;
    }),
  );
}
connect().catch(() => notify(t.loadFailure));
