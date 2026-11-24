import { projects } from "./content.mjs";

export function orbitSection({ lang, c, eye, btn, url }) {
  const fa = lang === "fa",
    labels = fa
      ? {
          field: "مدار پروژه‌ها",
          hint: "برای چرخش بکشید · برای جزئیات، یک پروژه را انتخاب کنید",
          rotate: "چرخش",
          pause: "توقف حرکت",
          play: "ادامه حرکت",
          reset: "نمای اولیه",
          zoomIn: "بزرگ‌نمایی",
          zoomOut: "کوچک‌نمایی",
          close: "بستن",
          control: "کنترل نمای پروژه‌ها",
          scene:
            "برای چرخاندن از کلیدهای جهت و برای تغییر اندازه از مثبت و منفی استفاده کنید.",
        }
      : {
          field: "Project orbit",
          hint: "Drag to orbit · Select a project to explore",
          rotate: "Orbit",
          pause: "Pause motion",
          play: "Resume motion",
          reset: "Reset view",
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          close: "Close",
          control: "Project map controls",
          scene: "Use arrow keys to orbit and plus or minus to zoom.",
        };
  return `<section class="hero observatory" aria-label="${c.identity}">
   <div class="observatory-inner">
    <div class="orbit-window" aria-hidden="true"></div>
    <div class="hero-copy">${eye(c.identity)}<h1>${c.headline[0]}<br><em>${c.headline[1]}</em></h1>
      <p class="hero-intro">${c.intro}</p>
      <div class="hero-buttons">${btn("primary", url("portal") + "?new=1", c.consult, "chat")}${btn("ghost", "#projects", c.explore, "grid")}</div>
    </div>
    <div class="orbit-stage" data-orbit dir="ltr" aria-label="${labels.field}">
      <img class="orbit-fallback" src="/art/hero.webp" width="1200" height="800" alt="">
      <canvas class="orbit-canvas" tabindex="0" aria-label="${labels.scene}"></canvas>
      <div class="orbit-eyeline" lang="${lang}" dir="${fa ? "rtl" : "ltr"}"><i aria-hidden="true"></i>${labels.field}</div>
      ${projects.map((p, i) => `<a data-node="${i}" class="orbit-node orbit-node-${i}" href="${url("work/" + p.id)}" aria-controls="orbit-card-${i}"><i aria-hidden="true"></i><span>${p[lang].name}</span></a>`).join("")}
      ${projects.map((p, i) => `<article class="orbit-card" id="orbit-card-${i}" hidden dir="${fa ? "rtl" : "ltr"}"><div class="orbit-card-head"><span>${p.type === "bank" ? c.bank : c.rd}</span><button type="button" data-orbit-close aria-label="${labels.close}">×</button></div><h2>${p[lang].name}</h2><p>${p[lang].summary}</p><a href="${url("work/" + p.id)}">${c.projectLink}</a></article>`).join("")}
    </div>
    <div class="orbit-foot"><p>${labels.hint}</p><div class="orbit-controls" hidden role="group" aria-label="${labels.control}">
       <button type="button" data-orbit-action="out" aria-label="${labels.zoomOut}">−</button><button type="button" data-orbit-action="in" aria-label="${labels.zoomIn}">+</button>
       <button type="button" data-orbit-action="motion" data-pause="${labels.pause}" data-play="${labels.play}">${labels.pause}</button><button type="button" data-orbit-action="reset">${labels.reset}</button>
    </div></div>
   </div></section>`;
}
