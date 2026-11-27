import {fields, review, usd, VERSION} from "./engine.mjs";
import {featuredScenarios} from "./scenarios.mjs";

const form = document.querySelector("#review-form");
const cases = document.querySelector("#scenarios");
const results = document.querySelector("#results");
const download = document.querySelector("#download");
const error = document.querySelector("#form-error");
const announcement = document.querySelector("#announcement");
let selected = "";
let latest;

fields.forEach(([key, label, min, max], index) => {
  const section = document.querySelector(index < 6 ? "#amount-fields" : "#date-fields");
  const field = document.createElement("label");
  field.className = "field";
  field.innerHTML = '<span>' + label + '</span><input name="' + key +
    '" type="number" autocomplete="off" inputmode="' + (index < 6 ? "decimal" : "numeric") +
    '" min="' + min + '" max="' + max + '" step="' + (index < 6 ? "0.01" : "1") + '" required>';
  section.append(field);
});

function render() {
  error.textContent = "";
  try {
    const input = Object.fromEntries(new FormData(form));
    const outcome = review(input);
    latest = {prototypeVersion: VERSION, caseId: selected || "custom", dataType: "synthetic", currency: "USD", monetaryOutputUnit: "cents", input, outcome};
    results.innerHTML = '<dl class="stats">' +
      [['Available for this loan', outcome.available], ['Regular installment', outcome.regular], ['Room after installment', outcome.room]]
        .map(([label, value]) => '<div><dt>' + label + '</dt><dd class="' + (value < 0 ? "negative" : "") + '">' + usd(value) + '</dd></div>').join("") +
      '</dl><div class="baseline"><span>Catch up in one payment</span><strong>' + usd(outcome.catchUp) + '</strong></div>' +
      '<div class="notice' + (outcome.suggested ? "" : " attention") + '"><strong>' + outcome.status + '</strong><p>' +
      (outcome.suggested ? outcome.timingNote : 'The modeled options need manual review. Check the budget and available hardship policies.') +
      '</p></div><ul class="options">' + outcome.options.map((option) =>
        '<li><div class="option-heading"><h3>' + option.title + (option.id === "shift" ? "" : ' · ' + option.term + ' months') +
        '</h3><span class="tag ' + (option.fits ? "fits" : "") + '">' +
        (option.id === outcome.suggested ? "First to review" : option.fits ? "Fits budget" : "Does not fit criteria") +
        '</span></div><p>' + option.reason + '</p><dl><div><dt>Peak payment</dt><dd>' + usd(option.peak) +
        '</dd></div><div><dt>Modeled extra fee</dt><dd>' + usd(option.fee) + '</dd></div></dl>' +
        (option.schedule ? '<details><summary>Payment schedule</summary><ol>' + option.schedule.map((payment) =>
          '<li>' + usd(payment) + '</li>').join("") + '</ol></details>' : "") + '</li>',
      ).join("") + '</ul>';
    download.disabled = false;
    announcement.textContent = "Options updated. " + outcome.status + ".";
  } catch (failure) {
    latest = undefined;
    download.disabled = true;
    results.replaceChildren();
    error.textContent = failure.message;
  }
}

function choose(scenario) {
  selected = scenario.id;
  for (const [key, value] of Object.entries(scenario.input)) form.elements[key].value = value;
  for (const button of cases.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.case === selected));
  render();
}

for (const scenario of featuredScenarios) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.case = scenario.id;
  button.className = "scenario";
  button.innerHTML = '<strong>' + scenario.name + '</strong><span>' + scenario.description + '</span>';
  button.addEventListener("click", () => choose(scenario));
  cases.append(button);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});
form.addEventListener("input", () => {
  selected = "";
  for (const button of cases.querySelectorAll("button")) button.setAttribute("aria-pressed", "false");
  download.disabled = true;
  latest = undefined;
  error.textContent = "";
  results.replaceChildren();
  announcement.textContent = "";
  const pending = document.createElement("p");
  pending.className = "notice";
  pending.textContent = "Inputs changed. Select Compare options to update the review.";
  results.append(pending);
});
download.addEventListener("click", () => {
  if (!latest) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(latest, null, 2) + "\n"], {type: "application/json"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = "installment-review-" + latest.caseId + ".json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

choose(featuredScenarios[0]);
