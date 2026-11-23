// The portal may reopen in a new tab after a magic-link sign-in.
const key = "mym.consultation.chat-draft.v1";
export function saveDraft(body, storage = localStorage) {
  const draft = {
    id: crypto.randomUUID(),
    body,
    expires: Date.now() + 3600000,
  };
  storage.setItem(key, JSON.stringify(draft));
}
export function readDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(key));
    if (
      draft?.expires > Date.now() &&
      typeof draft.body === "string" &&
      draft.body.length <= 5000 &&
      /^[a-f\d-]{36}$/i.test(draft.id)
    )
      return draft;
    clearDraft();
  } catch {}
  return null;
}
export function clearDraft(id) {
  try {
    if (!id || JSON.parse(localStorage.getItem(key))?.id === id)
      localStorage.removeItem(key);
  } catch {}
}
