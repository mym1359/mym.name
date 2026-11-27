import {orbitSection} from "./orbit-section.mjs";
import { copy, name, projects, pathFor } from "./content.mjs";
import { initiativeRoute, mortgageProject, mortgageProjectRoute, projectResources, relatedRepositories } from "./mortgage-project.mjs";
export const routes = [
  "",
  "work",
  ...projects.map((p) => "work/" + p.id),
  mortgageProjectRoute,
  "expertise",
  "about",
  "portal",
  "admin",
  "privacy",
];
const glyphs = {
  portal:
    '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M9 9v12"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  chat: '<path d="M20 14a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/><path d="M7 8h8M7 12h5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  menu: '<path d="M3 7h18M3 12h18M3 17h18"/>',
  workflow:
    '<rect x="2" y="3" width="7" height="6" rx="1.5"/><rect x="15" y="15" width="7" height="6" rx="1.5"/><path d="M5.5 9v8h9.5M9 6h9.5v9"/>',
  assistant:
    '<path d="M20 15a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/><path d="M7 8h8M7 12h5"/>',
  analytics: '<path d="M3 20h18M6 16v-5M12 16V6M18 16V3"/>',
  book: '<path d="M12 6C9 4 6 4 2 5v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1zm0 0v14"/>',
  focus:
    '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="3"/>',
  bank: '<path d="m2 8 10-5 10 5H2zm2 12h16M6 10v7m6-7v7m6-7v7"/>',
  pulse: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
};
export const icon = (k) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${glyphs[k] || ""}</svg>`;
export const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const eye = (s) => `<p class="eyebrow"><i aria-hidden="true"></i>${s}</p>`;
export function render(lang, route, base, live, preview = false) {
  const c = copy[lang],
    url = (r = "") => pathFor(lang, r),
    other = lang === "fa" ? "en" : "fa",
    fa = lang === "fa";
  const project = projects.find((p) => "work/" + p.id === route),
    article = route === mortgageProjectRoute ? mortgageProject[lang] : null,
    initiative = projects.find((p) => p.id === "initiative")[lang],
    secure = ["portal", "admin"].includes(route);
  const pageTitle = article?.title || (project
    ? project[lang].name + " · " + project[lang].subtitle
    : route === "404"
      ? c.notFound
      : {
          work: c.seo.workTitle,
          expertise: c.seo.servicesTitle,
          about: c.aboutEye,
          portal: c.signTitle,
          admin: c.dashboardTitle,
          privacy: c.privacyTitle,
        }[route] || c.seo.homeTitle);
  const desc =
    article?.summary ||
    project?.[lang].summary ||
    {
      work: c.seo.workDescription,
      expertise: c.seo.servicesDescription,
      about: c.aboutIntro,
      portal: c.signIntro,
      admin: c.dashIntro,
      privacy: c.privacyText[0],
    }[route] ||
    c.seo.homeDescription;
  const wordmark = `<a href="${url()}" class="wordmark" aria-label="MYM · ${c.home}"><img src="/assets/mym-logo.jpg" width="42" height="42" alt=""><span dir="ltr">mym<span class="brand-dot">.</span></span></a>`;
  const nav = () =>
    ["work", "expertise", "about"]
      .map(
        (k) =>
          `<a ${route === k || (k === "work" && (project || article)) ? 'aria-current="page"' : ""} href="${url(k)}">${c[k]}</a>`,
      )
      .join("");
  const language = `<a class="language" href="${pathFor(other, route === "404" ? "" : route)}" lang="${other}" hreflang="${other}">${icon("globe")}${c.language}</a>`;
  const header = `<header class="site-head"><div class="wrap head-inner">${wordmark}<nav class="desktop-nav" aria-label="${fa ? "منوی اصلی" : "Main navigation"}">${nav()}</nav><div class="head-actions">${language}<a class="head-portal" href="${url("portal")}">${icon("portal")}<span>${c.portal}</span></a><details class="mobile-menu"><summary aria-label="${c.menu}">${icon("menu")}</summary><nav>${nav()}<a href="${url("portal")}">${c.portal}</a></nav></details></div></div></header>`;
  const btn = (style, link, label, ic = "") =>
    `<a class="btn ${style}" href="${link}">${ic ? icon(ic) : ""}${label}</a>`;
  const contact = `<section class="contact"><div class="wrap contact-inner"><div><h2>${c.contact}</h2><p>${c.contactCopy}</p></div>${btn("primary", url("portal") + "?new=1", c.consult, "chat")}</div></section>`;
  const chat = route !== "admin" && route !== "404";
  const chatLabel = fa ? "مشاور هوش مصنوعی" : "AI consultation";
  const chatPanel = chat ? `<button type="button" id="open-chat" aria-haspopup="dialog" aria-controls="consult-chat">${icon("chat")}${chatLabel}</button><dialog id="consult-chat" aria-labelledby="chat-heading"><div class="chat-head"><h2 id="chat-heading">${chatLabel}</h2><button type="button" class="chat-close" aria-label="${fa ? "بستن" : "Close"}">×</button></div><div class="chat-history" role="log" aria-live="polite" aria-label="${fa ? "گفت‌وگو" : "Conversation"}"><p class="chat-bubble assistant">${fa ? "کدام کار در کسب‌وکارتان وقت زیادی می‌گیرد؟ سؤال را با دستیار هوش مصنوعی مطرح کنید. برای بررسی تخصصی می‌توانید آن را برای مشاور بفرستید." : "Which task takes the most time in your business? Ask the AI assistant. You can send questions that need a closer look to the consultant."}</p></div><div class="chat-prompts"></div><form class="chat-form"><label for="chat-question">${fa ? "سؤال شما · بدون اطلاعات محرمانه" : "Your question · omit confidential details"}</label><textarea id="chat-question" dir="auto" rows="2" maxlength="1000" required></textarea><button>${fa ? "ارسال سؤال" : "Ask question"}</button></form></dialog>` : "";
  const footer = `<footer><div class="wrap foot-inner">${wordmark}<p>${c.credit}</p><nav><a href="https://github.com/mym1359" rel="me">${c.github}</a><a href="${url("privacy")}">${c.privacy}</a><a href="${url("admin")}">${c.admin}</a></nav></div></footer>`;
  function work(index = false) {
    return `<section class="work-section wrap section" id="projects">${eye(c.workEye)}<div class="section-top"><div><${index ? "h1" : "h2"}>${c.workTitle}</${index ? "h1" : "h2"}><p>${c.workLead}</p></div><div class="filters" role="group" aria-label="${fa ? "فیلتر پروژه‌ها" : "Filter projects"}">${["all", "bank", "research"].map((v, i) => `<button type="button" data-filter="${v}" aria-pressed="${i === 0}">${c.filters[i]}</button>`).join("")}</div></div>
  <div class="project-grid">${projects.map((p) => `<article class="project-card" data-kind="${p.type}"><a href="${url("work/" + p.id)}"><div class="project-art"><img width="750" height="422" loading="lazy" src="/art/${p.id}.webp" alt=""><span>${p.type === "bank" ? c.bank : c.rd}</span></div><div class="card-copy"><p class="card-type">${p[lang].tags.join(" / ")}</p><h3>${p[lang].name}</h3><h4>${p[lang].subtitle}</h4><p>${p[lang].summary}</p><span class="read-link">${c.projectLink}</span></div></a></article>`).join("")}</div></section>`;
  }
  function services(index = false) {
    return `<section class="services"><div class="wrap section">${eye(c.expertEye)}<${index ? "h1" : "h2"}>${c.expertTitle}</${index ? "h1" : "h2"}><p class="lead">${c.expertLead}</p><div class="service-grid">${c.services.map((s) => `<article>${icon(s[0])}<h3>${s[1]}</h3><p>${s[2]}</p><div class="service-result"><strong>${c.deliverable}</strong><p>${s[3]}</p></div></article>`).join("")}</div></div></section>`;
  }
  function about(index = false) {
    return `<section class="wrap about section"><div>${eye(c.aboutEye)}<${index ? "h1" : "h2"}>${c.aboutTitle}</${index ? "h1" : "h2"}><p>${c.aboutIntro}</p>${index ? `<p>${c.aboutMore}</p>` : btn("outline", url("about"), c.bio)}</div><dl class="bio-facts">${[
      ["book", c.degree, c.university],
      ["bank", c.employer, c.experience],
      ["focus", c.focus, c.current],
    ]
      .map((x) => `<div>${icon(x[0])}<dt>${x[2]}</dt><dd>${x[1]}</dd></div>`)
      .join("")}</dl></section>`;
  }
  const metrics = `<div class="metric-band"><div class="wrap metrics">${c.metrics.map(([v, l]) => `<div><strong>${v}</strong><span>${l}</span></div>`).join("")}</div></div>`;
  const hero = route === "" ? orbitSection({lang,c,eye,btn,url}) : "";
  const resourceLinks = (links) =>
    `<ul class="project-resources">${links.map((link) => `<li><a href="${esc(link.url)}">${esc(link[lang])}</a></li>`).join("")}</ul>`;
  function initiativeProject() {
    const p = mortgageProject[lang];
    return `<section class="wrap prose section" aria-labelledby="initiative-project"><div class="initiative-feature"><h2 id="initiative-project">${esc(p.title)}</h2><p>${esc(p.summary)}</p>${btn("primary", url(mortgageProjectRoute), esc(p.articleLink))}${resourceLinks(projectResources)}</div></section>`;
  }
  function mortgageArticle() {
    const heading = `<header class="detail-hero"><div class="wrap prose section"><a class="crumb" href="${url(initiativeRoute)}">${esc(initiative.name)}</a><div class="article-heading"><h1 id="mortgage-title">${esc(article.title)}</h1><p>${esc(article.summary)}</p></div></div></header>`;
    const findings = `<dl class="article-findings">${article.findings.map(([value, label]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
    const figure = `<figure class="project-figure"><img src="/art/mortgage-review.webp" alt="${esc(article.imageAlt)}" width="1200" height="790"><figcaption>${esc(article.caption)}</figcaption></figure>`;
    const sections = article.sections.map(({ title, paragraphs, links }) =>
      `<section class="article-section"><h2>${esc(title)}</h2>${paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}${resourceLinks(links)}</section>`,
    ).join("");
    return `<article aria-labelledby="mortgage-title">${heading}<div class="wrap prose section project-article">${findings}${figure}${sections}<section class="article-section"><h2>${esc(article.resourceTitle)}</h2>${resourceLinks(projectResources.slice(1))}</section><section class="article-section"><h2>${esc(article.relatedTitle)}</h2><p>${esc(article.relatedSummary)}</p>${resourceLinks(relatedRepositories)}</section></div></article>${contact}`;
  }
  function detail() {
    const p = project[lang];
    return `<section class="detail-hero"><div class="wrap section"><a class="crumb" href="${url("work")}">${c.back}</a><div class="detail-split"><div>${eye(project.type === "bank" ? c.bank : c.rd)}<h1>${p.name}</h1><h2>${p.subtitle}</h2><p>${p.summary}</p></div><img width="750" height="422" src="/art/${project.id}.webp" alt=""></div></div></section>${route === initiativeRoute ? initiativeProject() : ""}<section class="wrap prose section">${p.parts.map((s, i) => `<h2>${[c.context, c.concept, c.stage][i]}</h2><p>${s}</p>`).join("")}</section>${contact}`;
  }
  function sign() {
    const admin = route === "admin";
    return `<section class="account-section wrap section"><div class="account-title">${eye(admin ? c.admin : c.portal)}<h1>${admin ? c.dashboardTitle : c.signTitle}</h1><p>${admin ? c.dashIntro : c.signIntro}</p></div><div id="workspace" aria-busy="false"><div class="signin-box"><span class="signin-icon">${icon("lock")}</span><h2>${c.auth}</h2><form id="email-login"><label for="email">${c.signEmail}</label><input id="email" type="email" autocomplete="email" dir="ltr" required maxlength="254" placeholder="name@example.com" ${live ? "" : "disabled"}><button class="btn primary" ${live ? "" : "disabled"}>${c.emailButton}</button></form><div class="or"><span>${c.or}</span></div><button id="google-login" class="btn outline" ${live ? "" : "disabled"}><b class="google-g">G</b>${c.google}</button><p id="login-note" role="status">${live ? "" : c.unavailable}</p>${!live ? `<div class="demo-links"><button data-preview="${admin ? "admin" : "client"}">${admin ? c.demoAdmin : c.demo}</button><a href="${url(admin ? "portal" : "admin")}">${admin ? c.demo : c.demoAdmin}</a></div>` : ""}<noscript>${c.nojs}</noscript></div></div></section>`;
  }
  let body;
  if (route === "")
    body = hero + metrics + work() + services() + about() + contact;
  else if (project) body = detail();
  else if (article) body = mortgageArticle();
  else if (route === "work") body = work(true) + contact;
  else if (route === "expertise") body = services(true) + contact;
  else if (route === "about") body = about(true) + metrics + contact;
  else if (secure) body = sign();
  else if (route === "privacy")
    body = `<section class="wrap prose section"><h1>${c.privacyTitle}</h1>${c.privacyText.map((p) => `<p>${p}</p>`).join("")}</section>`;
  else
    body = `<section class="wrap section"><h1>${c.notFound}</h1><p>${c.notFoundCopy}</p>${btn("outline", url(), c.home)}</section>`;
  const title = pageTitle + " | MYM · " + name[lang],
    canonical = base + url(route);
  const tags =
    base && !secure && route !== "404"
      ? `<link rel="canonical" href="${canonical}">${["en", "fa", "x-default"].map((l) => `<link rel="alternate" hreflang="${l}" href="${base + pathFor(l === "fa" ? "fa" : "en", route)}">`).join("")}<meta property="og:url" content="${canonical}"><meta property="og:image" content="${base}/art/${article ? "mortgage-review" : project?.id || "hero"}.webp">`
      : "";
  const graph = [];
  const personId = base + "/#mym";
  if (base && ["", "about"].includes(route)) {
    graph.push({
      "@type": "ProfilePage", inLanguage: lang, url: canonical,
      mainEntity: {
        "@type": "Person", "@id": personId, name: name[lang], alternateName: "MYM",
        url: base + url("about"), sameAs: ["https://github.com/mym1359"],
        alumniOf: { "@type": "CollegeOrUniversity", name: c.university },
        knowsAbout: fa ? ["آمار", "بانکداری", "هوش مصنوعی"] : ["Statistics", "Banking", "Applied artificial intelligence"],
      },
    });
  }
  if (base && !route) {
    graph.push({ "@type": "WebSite", "@id": base + "/#website", name: "MYM", url: base + "/", inLanguage: ["en", "fa"], publisher: { "@id": personId } });
  }
  if (base && (project || article)) {
    const crumbs = [[c.home, url()], [c.work, url("work")]];
    if (article) crumbs.push([initiative.name, url(initiativeRoute)]);
    crumbs.push([article?.title || project[lang].name, url(route)]);
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs
        .map(([label, path], index) => ({ "@type": "ListItem", position: index + 1, name: label, item: base + path })),
    });
  }
  if (base && article) {
    graph.push({
      "@type": "Article", headline: article.title, description: article.summary,
      inLanguage: lang, url: canonical, image: base + "/art/mortgage-review.webp",
      author: { "@type": "Person", "@id": personId, name: name[lang] },
    });
  }
  // Count the article under the existing initiative analytics page.
  const visitRoute = article ? initiativeRoute : route;
  const schema = graph.length
    ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script>`
    : "";
  return `<!doctype html><html lang="${lang}" dir="${fa ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#091e2c"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="${article ? "article" : "website"}"><meta property="og:locale" content="${fa ? "fa_IR" : "en_US"}"><meta name="twitter:card" content="summary_large_image">${schema}${tags}${preview || secure || route === "404" ? '<meta name="robots" content="noindex,nofollow">' : ""}<link rel="icon" href="/assets/mym-logo.jpg"><link rel="stylesheet" href="/assets/site.css">${chat ? '<link rel="stylesheet" href="/assets/chat.css">' : ""}<script type="module" src="/assets/site.js"></script>${route === "" ? '<link rel="stylesheet" href="/assets/orbit.css"><script type="module" src="/assets/orbit.js"></script>' : ""}${secure ? '<script type="module" src="/assets/workspace.js"></script>' : ""}</head><body data-route="${visitRoute}"><a href="#main" class="skip">${c.skip}</a>${header}<main id="main">${body}</main>${footer}${chatPanel}</body></html>`;
}
