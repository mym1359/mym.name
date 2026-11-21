const paths = new Set([
  "home",
  "work",
  "work/darj",
  "work/sepam",
  "work/initiative",
  "expertise",
  "about",
  "privacy",
]);
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  const origin =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL
      : "");
  if (
    !req.headers.origin ||
    !origin ||
    req.headers.origin !== new URL(origin).origin
  )
    return res.status(403).end();
  if (!req.headers["content-type"]?.startsWith("application/json"))
    return res.status(415).end();
  const data = req.body;
  if (!data || !paths.has(data.page) || !["en", "fa"].includes(data.lang))
    return res.status(400).end();
  if (
    !process.env.SUPABASE_URL ||
    !process.env.MYM_ANALYTICS_TOKEN ||
    !process.env.SUPABASE_PUBLISHABLE_KEY
  )
    return res.status(503).end();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const headers = { "content-type": "application/json", apikey: key };
  if (!key.startsWith("sb_publishable_"))
    headers.Authorization = "Bearer " + key;
  try {
    const upstream = await fetch(
      new URL("/rest/v1/rpc/mym_collect_view", process.env.SUPABASE_URL),
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_page: data.page,
          p_lang: data.lang,
          p_token: process.env.MYM_ANALYTICS_TOKEN,
        }),
        signal: AbortSignal.timeout(3500),
      },
    );
    return res.status(upstream.ok ? 204 : 503).end();
  } catch {
    return res.status(503).end();
  }
}
