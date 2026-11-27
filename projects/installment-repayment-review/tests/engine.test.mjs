import test from "node:test";
import assert from "node:assert/strict";
import {review} from "../demo/engine.mjs";
import {scenarios} from "../demo/scenarios.mjs";

for (const scenario of scenarios) {
  test(scenario.name, () => {
    const outcome = review(scenario.input);
    assert.equal(outcome.suggested, scenario.expected);
    assert.equal(outcome.status, scenario.expected ? "Reviewable options" : "Manual review");
    for (const option of outcome.options) {
      if (option.fits) assert.ok(option.peak <= outcome.available);
    }
  });
}

test("arrears and fees reconcile exactly across each schedule", () => {
  const outcome = review({...scenarios[6].input, fee: "12.11"});
  for (const option of outcome.options.slice(1)) {
    assert.equal(option.schedule.length, option.term);
    assert.equal(Math.max(...option.schedule), option.peak);
    assert.equal(option.schedule.reduce((sum, payment) => sum + payment, 0),
      outcome.regular * option.term + 30_101 + 1_211);
  }
});

test("an arrears plan with budget room still flags a timing mismatch", () => {
  const outcome = review(scenarios[5].input);
  assert.match(outcome.options[1].reason, /current due date/);
  assert.match(outcome.timingNote, /does not establish cash availability/);
});

test("an unaffordable catch-up payment rules out a timing-only shift", () => {
  const outcome = review({...scenarios[0].input, arrears: 350});
  assert.equal(outcome.options[0].fits, false);
  assert.match(outcome.options[0].reason, /exceeds the budget/);
});

test("an early due date can move to the same day as income", () => {
  assert.equal(review({...scenarios[0].input, newDueDay: 17}).suggested, "shift");
});

test("accepts browser strings and rejects missing, sub-cent or out-of-range inputs", () => {
  const input = Object.fromEntries(Object.entries(scenarios[0].input).map(([key, value]) => [key, String(value)]));
  assert.equal(review(input).suggested, "shift");
  for (const patch of [{income: ""}, {income: -1}, {payment: "1.001"}, {arrears: 0}, {dueDay: "1.5"}, {payday: 29}, {fee: Infinity}]) {
    assert.throws(() => review({...input, ...patch}), RangeError);
  }
});
