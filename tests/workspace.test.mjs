import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import handler from "../api/visit.js";
import { render, routes } from "../src/pages.mjs";

test("Workspace migration, isolation and consultation lifecycle on PostgreSQL", async (t) => {
  const db = new PGlite(),
    id1 = crypto.randomUUID(),
    id2 = crypto.randomUUID(),
    staff = crypto.randomUUID(),
    thread = crypto.randomUUID(),
    reply = crypto.randomUUID();
  const q = async (sql, p = []) => (await db.query(sql, p)).rows;
  const role = async (r, id = "") => {
    await db.exec("reset role; set role " + r);
    await q("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  };
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role;
   create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
   create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   grant usage on schema auth to anon,authenticated,service_role;`);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611210001_mym_workspace.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await q(
      "insert into mym_private.pending_admin values('owner@example.test')",
    );
    await q(
      "insert into auth.users values($1,'one@example.test',now()),($2,'two@example.test',now()),($3,'owner@example.test',null)",
      [id1, id2, staff],
    );
    await t.test(
      "Administrator appointment requires the designated verified identity",
      async () => {
        await role("authenticated", staff);
        assert.equal((await q("select mym_is_admin() ok"))[0].ok, false);
        await role("postgres");
        await q("update auth.users set email_confirmed_at=now() where id=$1", [
          staff,
        ]);
        assert.equal(
          (await q("select count(*) n from mym_private.pending_admin"))[0].n,
          0,
        );
        await role("authenticated", staff);
        assert.equal((await q("select mym_is_admin() ok"))[0].ok, true);
      },
    );
    await t.test(
      "Creation and retry store one request and one message",
      async () => {
        await role("authenticated", id1);
        const make = () =>
          q(
            "select mym_create_request($1,'analytics','Review measures','Define an initial baseline')",
            [thread],
          );
        await make();
        await make();
        assert.equal((await q("select * from mym_list_requests()")).length, 1);
        assert.equal(
          (await q("select * from mym_thread($1)", [thread])).length,
          1,
        );
        await assert.rejects(
          q("select mym_create_request($1,'analytics','New project',' ')", [
            crypto.randomUUID(),
          ]),
        );
        assert.equal((await q("select * from mym_list_requests()")).length, 1);
      },
    );
    await t.test(
      "Another client cannot read or alter a conversation, grant roles or read totals",
      async () => {
        await role("authenticated", id2);
        assert.equal((await q("select * from mym_list_requests()")).length, 0);
        assert.equal(
          (await q("select * from mym_thread($1)", [thread])).length,
          0,
        );
        for (const [sql, params] of [
          [
            "select mym_reply($1,$2,$3)",
            [thread, crypto.randomUUID(), "Demo follow-up"],
          ],
          ["select mym_set_status($1,'closed')", [thread]],
          ["select mym_metrics()", []],
          ["select * from mym_private.requests", []],
          ["insert into mym_private.administrators values($1)", [id2]],
          ["select mym_record_view('home','en')", []],
        ])
          await assert.rejects(q(sql, params));
      },
    );
    await t.test(
      "Admin can respond once, close, reopen and review the queue",
      async () => {
        await role("authenticated", staff);
        assert.equal(
          (await q("select * from mym_list_requests('','one@example',0)"))
            .length,
          1,
        );
        assert.equal(
          (await q("select * from mym_list_requests('','',0,true)")).length,
          0,
        );
        const send = () =>
          q("select mym_reply($1,$2,'I suggest a baseline')", [thread, reply]);
        await send();
        await send();
        assert.equal(
          (await q("select * from mym_thread($1)", [thread])).length,
          2,
        );
        await q("select mym_set_status($1,'closed')", [thread]);
        await role("authenticated", id1);
        await assert.rejects(
          q("select mym_reply($1,$2,'Follow up')", [
            thread,
            crypto.randomUUID(),
          ]),
          /thread_closed/,
        );
        await role("authenticated", staff);
        await q("select mym_set_status($1,'active')", [thread]);
        await role("authenticated", id1);
        await q("select mym_reply($1,$2,'Thank you')", [
          thread,
          crypto.randomUUID(),
        ]);
        assert.equal(
          (await q("select * from mym_thread($1)", [thread])).length,
          3,
        );
      },
    );
    await t.test(
      "Anonymous access is closed and view accounting uses server-only execution",
      async () => {
        await role("anon");
        for (const sql of [
          "select * from mym_list_requests()",
          "select mym_metrics()",
          "select mym_record_view('home','en')",
        ])
          await assert.rejects(q(sql));
        const token = "a".repeat(64);
        await assert.rejects(q("select mym_collect_view('home','en',$1)", [token]));
        await role("postgres");
        await q("insert into mym_private.collector(digest) values(sha256(convert_to($1,'UTF8')))", [token]);
        await role("anon");
        await q("select mym_collect_view('home','en',$1)", [token]);
        await assert.rejects(q("select * from mym_private.collector"));
        await role("service_role");
        await q("select mym_record_view('home','fa')");
        await role("authenticated", staff);
        const m = (await q("select mym_metrics() as m"))[0].m;
        assert.equal(m.accounts, 3);
        assert.equal(m.requests, 1);
        assert.equal(m.views, 2);
        assert.equal(m.en, 1);
        assert.equal(m.fa, 1);
        assert.equal(m.days.length, 30);
        assert.equal(m.pages[0].views, 2);
      },
    );
    await t.test("Reserving model capacity is server-only and enforces both limits", async () => {
      await role("postgres");
      await db.exec(await readFile(new URL("../supabase/migrations/202611230001_consultation_quota.sql", import.meta.url), "utf8"));
      await role("anon");
      const reserve = async (token, visitor) => (await q("select mym_reserve_assistant($1,$2) ok",[token,visitor]))[0].ok;
      const token = "a".repeat(64), visitor = "1".repeat(64);
      await assert.rejects(reserve("invalid",visitor));
      await assert.rejects(q("select * from mym_private.assistant_quota"));
      for(let i=0;i<12;i++) assert.equal(await reserve(token,visitor),true);
      assert.equal(await reserve(token,visitor),false);
      await role("postgres");
      await q("update mym_private.assistant_quota set calls=120 where bucket='all'");
      await role("anon");
      assert.equal(await reserve(token,"2".repeat(64)),false);
    });
  } finally {
    await db.close();
  }
});

test("Static pages provide per-language links, indexable content and private route exclusions", () => {
  for (const lang of ["en", "fa"])
    for (const route of routes) {
      const html = render(lang, route, "https://example.test", false);
      assert.match(
        html,
        new RegExp(
          'lang="' + lang + '" dir="' + (lang === "fa" ? "rtl" : "ltr") + '"',
        ),
      );
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
      const isPublic = !["portal", "admin"].includes(route);
      assert.equal(html.includes('hreflang="x-default"'), isPublic);
      assert.equal(html.includes('rel="canonical"'), isPublic);
      assert.match(render(lang, route, "https://example.test", false, true), /noindex,nofollow/);
      if (route.startsWith("work/")) {
        const json = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
        const trail = json["@graph"].find(node => node["@type"] === "BreadcrumbList").itemListElement;
        const segments = route.split("/");
        const origin = "https://example.test/" + (lang === "fa" ? "fa/" : "");
        assert.deepEqual(
          trail.map(({ item }) => item),
          [origin, ...segments.map((_, index) => origin + segments.slice(0, index + 1).join("/") + "/")],
        );
      }
      assert.equal(
        html.includes("noindex,nofollow"),
        ["portal", "admin"].includes(route),
      );
    }
});

test("Both portfolio languages link to the installment study and hosted demo", () => {
  const route = "work/initiative/installment-repayment-review";
  for (const lang of ["en", "fa"]) {
    const prefix = lang === "fa" ? "/fa/" : "/";
    for (const page of ["work", "work/initiative"]) {
      assert.ok(render(lang, page, "", false).includes('href="' + prefix + route + '/"'));
    }
    const study = render(lang, route, "", false);
    assert.ok(study.includes('href="/demos/installment-repayment-review/"'));
    assert.ok(study.includes("mym.name/tree/main/projects/installment-repayment-review"));
  }
});

test("Analytics endpoint rejects unrecognised requests before writing", async () => {
  const old = process.env.SITE_URL;
  process.env.SITE_URL = "https://example.test";
  try {
    for (const [method, origin, page, code] of [
      ["GET", "https://example.test", "home", 405],
      ["POST", "https://other.test", "home", 403],
      ["POST", "https://example.test", "admin", 400],
    ]) {
      let result;
      const res = {
        setHeader() {},
        status(n) {
          result = n;
          return this;
        },
        end() {},
      };
      await handler(
        {
          method,
          headers: { origin, "content-type": "application/json" },
          body: { page, lang: "en" },
        },
        res,
      );
      assert.equal(result, code);
    }
  } finally {
    if (old === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = old;
  }
});
