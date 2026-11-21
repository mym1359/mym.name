document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    const kind = button.dataset.filter;
    document
      .querySelectorAll("[data-filter]")
      .forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
    document.querySelectorAll("[data-kind]").forEach((card) => {
      card.hidden = kind !== "all" && card.dataset.kind !== kind;
    });
  }),
);
const menu = document.querySelector(".mobile-menu");
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.open) {
    menu.open = false;
    menu.querySelector("summary").focus();
  }
});
document.addEventListener("click", (e) => {
  if (menu?.open && !menu.contains(e.target)) menu.open = false;
});
if (
  __ANALYTICS__ &&
  document.visibilityState === "visible" &&
  !["portal", "admin", "404"].includes(document.body.dataset.route)
) {
  fetch("/api/visit/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: document.body.dataset.route || "home",
      lang: document.documentElement.lang,
    }),
    keepalive: true,
  }).catch(() => {});
}
