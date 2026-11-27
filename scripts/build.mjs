import { cp, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { render, routes } from "../src/pages.mjs";
import { pathFor } from "../src/content.mjs";
const root = path.resolve(import.meta.dirname, ".."),
  dist = path.join(root, "dist"),
  assets = path.join(dist, "assets");
const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const origin =
  process.env.SITE_URL || (deploymentHost ? "https://" + deploymentHost : "");
const base = origin ? new URL(origin).origin : "";
const preview = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");
const url = process.env.SUPABASE_URL || "",
  key = process.env.SUPABASE_PUBLISHABLE_KEY || "";
if (Boolean(url) !== Boolean(key))
  throw Error("Configure both Supabase public settings.");
if (url && new URL(url).protocol !== "https:")
  throw Error("Supabase URL must use HTTPS.");
if (key && !key.startsWith("sb_publishable_")) {
  let role;
  try {
    role = JSON.parse(Buffer.from(key.split(".")[1], "base64url")).role;
  } catch {}
  if (role !== "anon")
    throw Error(
      "Only a Supabase publishable or legacy anon key can be included in the frontend.",
    );
}
if (base && new URL(base).protocol !== "https:")
  throw Error("Canonical site URL must be HTTPS.");
await rm(dist, { recursive: true, force: true });
await mkdir(assets, { recursive: true });
await cp(path.join(root, "public"), dist, { recursive: true });
await cp(
  path.join(root, "projects/installment-repayment-review/demo"),
  path.join(dist, "demos/installment-repayment-review"),
  { recursive: true },
);
for (const n of [400, 500, 600])
  await cp(
    path.join(
      root,
      `node_modules/@fontsource/poppins/files/poppins-latin-${n}-normal.woff2`,
    ),
    path.join(assets, `poppins${n}.woff2`),
  );
await cp(
  path.join(
    root,
    "node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2",
  ),
  path.join(assets, "vazir.woff2"),
);
for (const [name, folder] of [
  ["poppins", "@fontsource/poppins"],
  ["vazirmatn", "@fontsource-variable/vazirmatn"],
])
  await cp(
    path.join(root, "node_modules", folder, "LICENSE"),
    path.join(assets, name + "-license.txt"),
  );
await writeFile(path.join(assets, "config.json"), JSON.stringify({ url, key }));
await build({
  entryPoints: [
    path.join(root, "src/site.mjs"),
    path.join(root, "src/orbit.mjs"),
    path.join(root, "src/workspace.mjs"),
  ],
  bundle: true,
  platform: "browser",
  target: "es2022",
  format: "esm",
  outdir: assets,
  minify: true,
  splitting: true,
  entryNames: "[name]",
  chunkNames: "chunk-[hash]",
  define: {
    __ANALYTICS__: JSON.stringify(
      Boolean(base && url && process.env.MYM_ANALYTICS_TOKEN),
    ),
  },
});
for (const lang of ["en", "fa"])
  for (const route of routes) {
    const dir = path.join(dist, pathFor(lang, route));
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, "index.html"),
      render(lang, route, base, !!key, preview),
    );
  }
await writeFile(path.join(dist, "404.html"), render("en", "404", base, false));
await writeFile(
  path.join(dist, "robots.txt"),
  `User-agent: *\nDisallow: /api/\n${base && !preview ? "Sitemap: " + base + "/sitemap.xml\n" : ""}`,
);
if (base && !preview) {
  const entries = routes
    .filter((r) => !["admin", "portal"].includes(r))
    .flatMap((r) =>
      ["en", "fa"].map(
        (l) =>
          `<url><loc>${base}${pathFor(l, r)}</loc>${["en", "fa", "x-default"].map((v) => `<xhtml:link rel="alternate" hreflang="${v}" href="${base}${pathFor(v === "fa" ? "fa" : "en", r)}"/>`).join("")}</url>`,
      ),
    );
  await writeFile(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join("")}</urlset>`,
  );
}
console.log(
  `Built ${routes.length * 2} bilingual routes. Workspace: ${key ? "connected configuration" : "sample preview"}.`,
);
