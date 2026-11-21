export function previewData(t, isAdmin) {
  const now = () => new Date().toISOString(),
    messages = new Map(),
    first = crypto.randomUUID(),
    second = crypto.randomUUID();
  let serial = 0;
  const msg = (advisor, body) => ({
    seq: ++serial,
    advisor,
    body,
    created_at: now(),
  });
  let rows = [
    {
      id: first,
      subject: t.sampleSubject,
      topic: "assistant",
      status: "active",
      updated_at: now(),
      client_email: t.sampleMail,
    },
    {
      id: second,
      subject: t.sampleSubject2,
      topic: "workflow",
      status: "open",
      updated_at: now(),
      client_email: t.sampleMail,
    },
  ];
  rows.forEach((r, i) =>
    messages.set(
      r.id,
      i
        ? [msg(false, t.sampleBody2)]
        : [msg(false, t.sampleBody), msg(true, t.sampleReply)],
    ),
  );
  const byId = (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row) throw Error("unknown_request");
    return row;
  };
  return async function rpc(action, p = {}) {
    switch (action) {
      case "is_admin":
        return isAdmin;
      case "list_requests":
        return rows
          .filter(
            (r) =>
              (!p.p_status || r.status === p.p_status) &&
              [r.subject, r.client_email].some((s) =>
                s.toLowerCase().includes(p.p_search.toLowerCase()),
              ),
          )
          .slice(p.p_offset, p.p_offset + 16);
      case "thread":
        return (messages.get(p.p_request) || [])
          .filter((m) => !p.p_before || m.seq < p.p_before)
          .slice()
          .reverse()
          .slice(0, 31);
      case "create_request": {
        if (!rows.some((r) => r.id === p.p_id)) {
          rows.unshift({
            id: p.p_id,
            topic: p.p_topic,
            subject: p.p_subject,
            status: "open",
            updated_at: now(),
            client_email: t.sampleMail,
          });
          messages.set(p.p_id, [msg(false, p.p_body)]);
        }
        return p.p_id;
      }
      case "reply": {
        const r = byId(p.p_request);
        if (r.status === "closed") throw Error("thread_closed");
        messages.get(r.id).push(msg(isAdmin, p.p_body));
        if (isAdmin) r.status = "active";
        r.updated_at = now();
        rows = [r, ...rows.filter((i) => i.id !== r.id)];
        return;
      }
      case "set_status": {
        if (!isAdmin) throw Error("denied");
        const r = byId(p.p_request);
        r.status = p.p_status;
        r.updated_at = now();
        return;
      }
      case "metrics": {
        if (!isAdmin) throw Error("denied");
        const days = Array.from({ length: 30 }, (_, i) => ({
          day: new Date(Date.now() - (29 - i) * 86400000)
            .toISOString()
            .slice(0, 10),
          views: 3 + ((i * 13) % 19),
        }));
        const views = days.reduce((s, x) => s + x.views, 0),
          fa = Math.floor(views * 0.35);
        return {
          accounts: 2,
          requests: rows.length,
          open: rows.filter((r) => r.status === "open").length,
          active: rows.filter((r) => r.status === "active").length,
          closed: rows.filter((r) => r.status === "closed").length,
          views,
          en: views - fa,
          fa,
          days,
          pages: [
            { page: "home", views: Math.ceil(views * 0.55) },
            { page: "work", views: Math.floor(views * 0.45) },
          ],
        };
      }
      default:
        throw Error("unknown_operation");
    }
  };
}
