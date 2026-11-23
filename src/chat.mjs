import { saveDraft } from "./chat-draft.mjs";

const lang = document.documentElement.lang;
const fa = lang === "fa";
const dialog = document.querySelector("#consult-chat");
const opener = document.querySelector("#open-chat");
const log = dialog.querySelector('[role="log"]');
const field = dialog.querySelector("textarea");
const suggestions = dialog.querySelector(".chat-prompts");
const ask = fa
  ? [
      "از کجا هوش مصنوعی را در شرکتم شروع کنم؟",
      "چطور پشتیبانی مشتری را بهتر کنم؟",
      "بازگشت سرمایه را چطور بسنجیم؟",
    ]
  : [
      "Where should my business start with AI?",
      "How can AI help customer support?",
      "How do we measure ROI?",
    ];
const history = [];
const send = dialog.querySelector(".chat-form button");
let pending = false;
let guideTopic = null;
function bubble(text, from) {
  const el = document.createElement("p");
  el.className = "chat-bubble " + from;
  el.dir = "auto";
  el.textContent = text;
  log.append(el);
  log.scrollTop = log.scrollHeight;
}
async function submit(question) {
  if (pending || !question.trim()) return;
  const q = question.trim().slice(0, 1000);
  const earlier = history
    .filter((m) => m.role === "user")
    .map((m) => m.content);
  pending = true;
  send.disabled = true;
  field.value = "";
  suggestions.hidden = true;
  log.querySelector(".chat-refer")?.remove();
  bubble(q, "visitor");
  send.textContent = fa ? "در حال بررسی…" : "Considering…";
  let result;
  try {
    const response = await fetch("/api/consult/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, question: q, history }),
      signal: AbortSignal.timeout(35000),
    });
    if (!response.ok) throw Error(String(response.status));
    result = await response.json();
    if (
      !["answer", "clarify", "outside", "refer"].includes(result?.kind) ||
      typeof result.text !== "string"
    )
      throw Error("invalid");
    guideTopic = null;
  } catch (error) {
    const limited = error.message === "429";
    const notice = fa
      ? limited
        ? "سقف استفاده از مدل پر شده است."
        : "مدل زبانی فعلاً در دسترس نیست."
      : limited
        ? "The model usage limit has been reached."
        : "The language model is temporarily unavailable.";
    try {
      const { answerQuestion } = await import("./chat-guide.mjs");
      const guide = answerQuestion(q, lang, guideTopic);
      guideTopic = guide.topic;
      result = {
        kind: guide.kind,
        text:
          notice +
          (fa ? " پاسخ راهنمای سایت: " : " From the site guide: ") +
          guide.text,
      };
    } catch {
      result = {
        kind: "refer",
        text:
          notice +
          (fa
            ? " می‌توانید سؤال را برای مشاور بفرستید."
            : " You can send this question to the consultant."),
      };
    }
  } finally {
    pending = false;
    send.disabled = false;
    send.textContent = fa ? "ارسال سؤال" : "Ask question";
  }
  history.push(
    { role: "user", content: q },
    { role: "assistant", content: result.text.slice(0, 1000) },
  );
  history.splice(0, Math.max(0, history.length - 4));
  bubble(result.text, "assistant");
  if (["refer", "answer", "clarify"].includes(result.kind)) {
    const button = document.createElement("button");
    button.className = "chat-refer";
    button.type = "button";
    button.textContent = fa
      ? "بررسی و ارسال به مشاور"
      : "Review and send to the consultant";
    const body = [...earlier, q].join("\n\n");
    button.onclick = () => {
      try {
        saveDraft(body);
        location.assign((fa ? "/fa" : "") + "/portal/?new=1");
      } catch {
        bubble(
          fa
            ? "ذخیرهٔ پیش‌نویس ممکن نشد. سؤال را کپی کنید و از بخش «پنل مشتریان» درخواست جدید بسازید."
            : "Draft storage is unavailable. Copy your question and start a new request in the client portal.",
          "assistant",
        );
      }
    };
    log.append(button);
  }
  log.scrollTop = log.scrollHeight;
  field.focus();
}
for (const q of ask) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = q;
  button.onclick = () => submit(q);
  suggestions.append(button);
}
dialog.querySelector("form").onsubmit = (e) => {
  e.preventDefault();
  submit(field.value);
};
dialog.querySelector(".chat-close").onclick = () => dialog.close();
dialog.addEventListener("close", () => opener.focus());
export function openChat() {
  if (!dialog.open) dialog.showModal();
  field.focus();
}
