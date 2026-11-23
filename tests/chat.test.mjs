import test from "node:test";
import assert from "node:assert/strict";
import { answerQuestion } from "../src/chat-guide.mjs";

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
