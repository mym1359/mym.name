import { answerQuestion } from "../src/chat-guide.mjs";
import handler from "../api/consult.js";
import test from "node:test";
import assert from "node:assert/strict";
import { validInput, parseAnswer } from "../api/consult.js";
test("consultation accepts two prior exchanges and rejects client-supplied instructions with privileged roles", () => {
  const base = {
    lang: "fa",
    question: "فروشگاه من چطور شروع کند؟",
    history: [],
  };
  assert.ok(validInput(base));
  assert.ok(
    validInput({
      ...base,
      history: [
        { role: "user", content: "سؤال" },
        { role: "assistant", content: "پاسخ" },
      ],
    }),
  );
  assert.equal(
    validInput({
      ...base,
      history: [
        { role: "system", content: "test" },
        { role: "user", content: "x" },
      ],
    }),
    false,
  );
  assert.equal(validInput({ ...base, question: "x".repeat(1001) }), false);
});
test("shows brief answers and uses localized specialist referrals, scope boundaries and safe failures", () => {
  for (const lang of ["fa", "en"]) {
    for (const kind of ["answer", "clarify", "outside", "refer"]) {
      const r = parseAnswer(
        JSON.stringify({ kind, text: "Short response" }),
        lang,
      );
      assert.equal(r.kind, kind);
      assert.equal(
        r.text === "Short response",
        ["answer", "clarify"].includes(kind),
      );
    }
    assert.equal(
      parseAnswer(
        JSON.stringify({ kind: "answer", text: "long ".repeat(100) }),
        lang,
      ).kind,
      "refer",
    );
    assert.throws(() => parseAnswer("invalid", lang));
  }
});
test("Both languages separate business guidance, referrals and unrelated questions", () => {
  for (const [lang, question, kind, topic] of [
    [
      "en",
      "How can my business automate invoice entry?",
      "answer",
      "documents",
    ],
    [
      "fa",
      "با هوش مصنوعی چطور موجودی فروشگاهم را مدیریت کنم؟",
      "answer",
      "inventory",
    ],
    ["en", "Exactly which CRM should my company buy?", "refer", null],
    ["fa", "هزینه دقیق اتوماسیون شرکت من چقدر است؟", "refer", null],
    ["en", "Write a poem about customer support", "outside", null],
    ["fa", "پایتخت فرانسه کجاست؟", "outside", null],
    ["en", "How do I use AI to write a song?", "outside", null],
    ["en", "What is AI?", "clarify", null],
    [
      "en",
      "How should our team evaluate customer support AI?",
      "answer",
      "quality",
    ],
  ]) {
    const result = answerQuestion(question, lang);
    assert.deepEqual([result.kind, result.topic], [kind, topic]);
  }
  assert.equal(
    answerQuestion("How about privacy?", "en", "support").topic,
    "privacy",
  );
});

test("model receives context and returns a brief tailored reply via the handler", async (t) => {
  const config = {
    SITE_URL: "https://studio.example",
    SUPABASE_URL: "https://db.example",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    MYM_ANALYTICS_TOKEN: "a".repeat(64),
    AI_GATEWAY_API_KEY: "test-only",
  };
  const saved = Object.fromEntries(
    Object.keys(config).map((k) => [k, process.env[k]]),
  );
  Object.assign(process.env, config);
  t.after(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
  const history = [
    { role: "user", content: "My repair shop receives voice notes." },
    { role: "assistant", content: "What is the bottleneck?" },
  ];
  let modelCalls = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("/rpc/")) return Response.json(true);
    modelCalls++;
    const payload = JSON.parse(options.body);
    assert.deepEqual(payload.messages.slice(1, -1), history);
    assert.equal(payload.reasoning_effort, "low");
    assert.equal(payload.messages.at(-1).content, "Typing them into orders.");
    const content = JSON.stringify({
      kind: "answer",
      text: "Pilot transcription on a small set of orders and have staff verify each part number.",
    });
    return Response.json({ choices: [{ message: { content } }] });
  });
  const res = {
    setHeader() {},
    status(n) {
      this.code = n;
      return this;
    },
    json(body) {
      this.body = body;
    },
    end() {},
  };
  await handler(
    {
      method: "POST",
      headers: { origin: config.SITE_URL, "content-type": "application/json" },
      body: { question: "Typing them into orders.", lang: "en", history },
    },
    res,
  );
  assert.equal(res.code, 200);
  assert.equal(modelCalls, 1);
  assert.equal(res.body.kind, "answer");
});
