import {readFile, writeFile} from "node:fs/promises";
import {review, VERSION} from "../demo/engine.mjs";
import {scenarios} from "../demo/scenarios.mjs";

const cases = scenarios.map(({id, name, input, expected}) => {
  const outcome = review(input);
  return {
    id, name, expected, actual: outcome.suggested,
    immediateCatchUpFitsMonthlyBudget: outcome.catchUp <= outcome.available,
    candidateWithinBudget: outcome.options.some((option) => option.fits),
    positiveBudgetCheck: outcome.options.every((option) => !option.fits || option.peak <= outcome.available),
  };
});
const report = {
  prototypeVersion: VERSION,
  evidence: "Hand-written synthetic rule checks",
  count: cases.length,
  matchingExpectations: cases.filter((entry) => entry.expected === entry.actual && entry.positiveBudgetCheck).length,
  immediateCatchUpFits: cases.filter((entry) => entry.immediateCatchUpFitsMonthlyBudget).length,
  candidateWithinBudget: cases.filter((entry) => entry.candidateWithinBudget).length,
  cases,
};
const json = JSON.stringify(report, null, 2) + "\n";
const reportPath = new URL("../docs/synthetic-results.json", import.meta.url);
if (process.argv.includes("--write")) await writeFile(reportPath, json);
else if (process.argv.includes("--check")) {
  if (await readFile(reportPath, "utf8") !== json) throw Error("Regenerate the checked-in report with npm run evaluate -- --write.");
} else process.stdout.write(json);
if (report.matchingExpectations !== report.count) process.exitCode = 1;
