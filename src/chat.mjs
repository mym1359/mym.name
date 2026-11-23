import { answerQuestion } from "./chat-guide.mjs";
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
let previousTopic = null;
let previousQuestion = "";
function bubble(text, from) {
  const el = document.createElement("p");
  el.className = "chat-bubble " + from;
  el.dir = "auto";
  el.textContent = text;
  log.append(el);
  log.scrollTop = log.scrollHeight;
}
function submit(question) {
  if (!question.trim()) return;
  const q = question.trim().slice(0, 1000);
  const result = answerQuestion(q, lang, previousTopic);
  suggestions.hidden = true;
  log.querySelector(".chat-refer")?.remove();
  bubble(q, "visitor");
  bubble(result.text, "assistant");
  if (["refer", "answer", "clarify"].includes(result.kind)) {
    const button = document.createElement("button");
    button.className = "chat-refer";
    button.type = "button";
    button.textContent = fa
      ? "بررسی و ارسال به مشاور"
      : "Review and send to the consultant";
    const body =
      previousTopic && previousQuestion
        ? (fa ? "سؤال قبلی: " : "Earlier question: ") +
          previousQuestion +
          "\n\n" +
          q
        : q;
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
  previousTopic =
    result.topic ||
    (result.kind === "clarify"
      ? "clarify"
      : result.kind === "refer"
        ? previousTopic
        : null);
  previousQuestion = q;
  field.value = "";
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
