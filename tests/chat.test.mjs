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
