# Methodology

## Use case

An analyst reviews the first missed payment on an already-issued small-dollar installment loan. The prototype makes the budget assumptions and payment comparisons explicit before the analyst considers a hardship option under the institution’s own policy.

## Inputs and rules

- Available monthly amount equals take-home income minus essential spending, other debts and a reserve. Do not count this loan in essential spending or count income twice.
- The input arrears are already past due and separate from the next regular payment. The immediate catch-up baseline is their sum.
- A due-date move fits this model only if the existing recurring due day precedes expected income, the proposed day is on or after that income, and the immediate catch-up payment fits. The modeled move adds no fee. Days 1–28 keep the date examples valid in all calendar months. The model abstracts from notice periods, month boundaries, weekend processing, and balance as of the due date.
- A split plan spreads the arrears across two, three, or six monthly payments on top of the regular installment. Each cent left after integer division is allocated to the earliest months. A one-time assumed split-plan fee is charged in month one. The peak installment must fit within the monthly budget. If the existing date still precedes income, the result calls for a separate cash-timing check.
- The first option shown for review is a qualifying due-date move, otherwise the shortest qualifying split. This is a documented ordering policy. If none fits, the tool returns manual review. A budget fit is neither approval nor a guarantee of funds at the payment deadline.
- The tool evaluates peak monthly payment and incremental modeled fees. Contractual interest and the lifetime cost of the loan require the original agreement, actual dates, and lender rules and are beyond this prototype.

## Evidence and assumptions

The [Federal Reserve SHED public survey](https://www.federalreserve.gov/consumerscommunities/shed_data.htm) informs scenario themes such as income timing and missed bills. [NCUA Call Report data](https://ncua.gov/analysis/credit-union-corporate-call-report-data/quarterly-data) is useful for prospective market and portfolio context. Neither dataset supplies the inputs or post-intervention labels of our example borrowers. Scenario inputs were authored manually, without fitting or imputation from survey records.

The [interagency small-dollar lending principles](https://www.fdic.gov/sites/default/files/2024-03/pr20061a.pdf) identify timely, reasonable assistance as a servicing practice. The [CFPB’s ECOA examination guidance](https://files.consumerfinance.gov/f/documents/cfpb_ecoa-narrative-and-procedures_2026-07.pdf) discusses the relevance of Regulation B to some loan modifications. Institution policy, fair-treatment reviews, and disclosures are separate implementation questions.

Existing products such as [Constant AI](https://constant.ai/news/delinquency-shield-launch) and [AKUVO](https://www.akuvo.com/platform) already support hardship or repayment workflows. The project contribution is a small, auditable implementation and reproducible test protocol for a precisely bounded scenario.

## Reproduce the checks

Run `npm test` and `npm run evaluate -- --check`. Use `npm run evaluate -- --write` after an intentional rule or fixture change. The baseline addresses affordability of immediate catch-up and the candidate count covers several options. The comparison documents why some cases merit further review. It is not a causal comparison.
