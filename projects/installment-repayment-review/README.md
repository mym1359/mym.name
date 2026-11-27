# Installment Repayment Review

A browser-based research prototype for reviewing repayment options after the first missed payment on a small-dollar installment loan. It compares a due-date change and three ways to spread the arrears, explains each calculation, and exports an auditable synthetic case record. It is intended as a reviewer aid. Each option requires an institution’s policy and human judgment to be used on a real account.

- [Try the English demo](https://mym-studio.vercel.app/demos/installment-repayment-review/)
- [Read the portfolio case study](https://mym-studio.vercel.app/work/initiative/installment-repayment-review/)
- [Read the methodology](docs/methodology.md) · [Reproducible results](docs/synthetic-results.json) · [Reviewer protocol](docs/reviewer-protocol.md)

## Try it locally

From this project folder, use Node.js 22+ for the checks and Python 3 for a local static server. There are no npm dependencies.

```sh
npm test
npm run evaluate -- --check
python3 -m http.server 8000 --bind 127.0.0.1 --directory demo
```

Visit `http://127.0.0.1:8000/`, choose a synthetic case, edit the budget or dates, choose **Compare options**, and export the result. Money is displayed in USD. The export records calculation outputs in integer cents with explicit unit metadata.

## Evidence at a glance

The reproducible evaluation covers eight hand-written edge cases, including a date mismatch, a first-month fee, equal budget and peak payment, uneven cents, and a negative monthly margin. All eight satisfy the expected behavior. Two allow an immediate catch-up payment under the monthly budget. Six have at least one reviewable modeled option. These counts describe selected fixtures and show how the rule behaves. They are not representative rates or evidence of better repayment or lower collection costs.

## Files

- `demo/` contains the interface, calculation engine, and synthetic scenario definitions.
- `tests/` checks decisions, boundary inputs, date rules, and exact cent reconciliation.
- `scripts/evaluate.mjs` regenerates or verifies the evaluation report.
- `docs/` documents methods, evidence limits, and an independent evaluation design.

The portfolio build copies the contents of this project’s `demo/` into the public site. All form calculations run locally in the browser. The demo has no backend, account system, persistent case storage, or automatic payment actions. Use fictional inputs. See the reviewer protocol for how authorized future evaluation could track repayment and operational outcomes.
