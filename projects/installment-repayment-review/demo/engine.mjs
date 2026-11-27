// All monetary calculations use integer cents. Dates represent recurring days 1–28.
export const VERSION = "1.0.0";
export const fields = [
  ["income", "Monthly take-home income", 0, 100000],
  ["essentials", "Monthly essentials and other debts", 0, 100000],
  ["reserve", "Monthly amount to keep in reserve", 0, 100000],
  ["payment", "Regular monthly loan payment", 1, 10000],
  ["arrears", "Amount already past due", 1, 10000],
  ["fee", "One-time fee for an arrears plan", 0, 1000],
  ["payday", "Expected recurring income day", 1, 28],
  ["dueDay", "Current recurring due day", 1, 28],
  ["newDueDay", "Proposed recurring due day", 1, 28],
];

export const usd = (cents) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD",
}).format(cents / 100);

function validate(input) {
  for (const [key, label, min, max] of fields) {
    const value = input[key];
    const isDay = key === "payday" || key.endsWith("DueDay") || key === "dueDay";
    const pattern = isDay ? /^\d+$/ : /^\d+(\.\d{1,2})?$/;
    if (value == null || !pattern.test(String(value)) || Number(value) < min || Number(value) > max) {
      throw new RangeError(label + " must be between " + min + " and " + max + (isDay ? " (whole days)." : " USD, with up to two decimal places."));
    }
  }
}

export function review(input) {
  validate(input);
  const cents = (key) => Math.round(Number(input[key]) * 100);
  const available = cents("income") - cents("essentials") - cents("reserve");
  const regular = cents("payment");
  const arrears = cents("arrears");
  const fee = cents("fee");
  const room = available - regular;
  const current = Number(input.dueDay);
  const proposed = Number(input.newDueDay);
  const incomeDay = Number(input.payday);
  const dueShiftResolvesTiming = current < incomeDay && incomeDay <= proposed;
  // Day-only model assumes arrears are collected alongside the next regular payment.
  const catchUp = regular + arrears;
  const shift = {
    id: "shift", title: "Move the due date", term: 1, peak: catchUp, fee: 0,
    fits: dueShiftResolvesTiming && catchUp <= available,
    reason: !dueShiftResolvesTiming
      ? "The proposed change must move the due date from before income to on or after income."
      : catchUp > available
        ? "The next regular payment plus arrears exceeds the budget."
        : "The proposed day follows expected income, and the budget covers the next payment plus arrears.",
  };
  const plans = [2, 3, 6].map((term) => {
    const portion = Math.floor(arrears / term);
    const remainder = arrears % term;
    const schedule = Array.from({length: term}, (_, index) =>
      regular + portion + Number(index < remainder) + (index === 0 ? fee : 0));
    const peak = schedule[0];
    const fits = peak <= available;
    return {
      id: "spread-" + term, title: "Spread the arrears", term, peak, fee, schedule, fits,
      reason: fits
        ? "The largest modeled payment fits the monthly budget."
        : "The largest modeled payment exceeds the monthly budget.",
    };
  });
  if (current < incomeDay) {
    for (const plan of plans) {
      if (plan.fits) plan.reason += " Confirm that funds are available by the current due date.";
    }
  }
  const options = [shift, ...plans];
  const suggested = options.find((option) => option.fits);
  return {
    available, regular, room, catchUp, options, suggested: suggested?.id ?? null,
    status: suggested ? "Reviewable options" : "Manual review",
    timingNote: current < incomeDay
      ? "The current due day precedes expected income. Monthly budget fit alone does not establish cash availability on that date."
      : "The current due day is on or after expected income in this simplified calendar.",
  };
}
