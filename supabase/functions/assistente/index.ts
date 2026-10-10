// Assistente Studio Zero: riceve un messaggio dalla chat dell'app e, con Claude, modifica i dati.
// Usa il token dell'utente: valgono gli stessi permessi (RLS) dell'app. Solo per admin.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-5-5";

const iso = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
const addDays = (s: string, n: number) => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const TOOLS = [
  { name: "cerca_serate", description: "Elenca le serate tra due date (YYYY-MM-DD) con operatori, consegne e compenso.", input_schema: { type: "object", properties: { da: { type: "string" }, a: { type: "string" } }, required: ["da", "a"] } },
  { name: "modifica_serata", description: "Modifica una serata esistente. status: confermata | da_confermare | saltata. video: clip | reel | clip+reel | null. fee = compenso del cliente in euro. Orari HH:MM.", input_schema: { type: "object", properties: { id: { type: "string" }, campi: { type: "object", properties: { status: { type: "string" }, name: { type: "string" }, venue: { type: "string" }, date: { type: "string" }, start_time: { type: "string" }, end_time: { type: "string" }, photos: { type: "string" }, stories: { type: "string" }, video: { type: ["string", "null"] }, notes: { type: "string" }, shots_tips: { type: "string" }, instagram_url: { type: "string" }, pixieset_prev_url: { type: "string" }, edit_by_riky: { type: "boolean" }, fee: { type: "number" } } } }, required: ["id", "campi"] } },
  { name: "crea_serata", description: "Crea una nuova serata. Se esiste un format con lo stesso nome ne copia i dati mancanti. Crea da sola le consegne (foto +3 giorni, clip stessa sera, reel +5).", input_schema: { type: "object", properties: { name: { type: "string" }, date: { type: "string" }, venue: { type: "string" }, start_time: { type: "string" }, end_time: { type: "string" }, photos: { type: "string" }, stories: { type: "string" }, video: { type: "string", enum: ["clip", "reel", "clip+reel"] }, fee: { type: "number" }, operatore: { type: "string", description: "nome della persona" }, edit_by_riky: { type: "boolean" }, notes: { type: "string" } }, required: ["name", "date"] } },
  { name: "assegna", description: "Assegna una persona a una serata (e le consegne senza assegnatario).", input_schema: { type: "object", properties: { event_id: { type: "string" }, persona: { type: "string" }, operator_fee: { type: "number" } }, required: ["event_id", "persona"] } },
  { name: "togli", description: "Toglie una persona da una serata.", input_schema: { type: "object", properties: { event_id: { type: "string" }, persona: { type: "string" } }, required: ["event_id", "persona"] } },
  { name: "aggiungi_consegna", description: "Aggiunge una consegna (foto, clip, reel) a una serata.", input_schema: { type: "object", properties: { event_id: { type: "string" }, tipo: { type: "string", enum: ["foto", "clip", "reel"] }, scadenza: { type: "string" }, persona: { type: "string" }, label: { type: "string" } }, required: ["event_id", "tipo"] } },
  { name: "segna_consegna", description: "Segna una consegna come fatta (o la riapre) e/o salva il link.", input_schema: { type: "object", properties: { deliverable_id: { type: "string" }, fatta: { type: "boolean" }, link: { type: "string" } }, required: ["deliverable_id"] } },
  { name: "segna_pagamento", description: "Segna se il cliente ha pagato una serata, o se un operatore è stato pagato.", input_schema: { type: "object", properties: { event_id: { type: "string" }, cliente_pagato: { type: "boolean" }, persona: { type: "string" }, operatore_pagato: { type: "boolean" } }, required: ["event_id"] } },
  { name: "modifica_cliente", description: "Aggiorna la scheda di un cliente/locale per nome.", input_schema: { type: "object", properties: { cliente: { type: "string" }, campi: { type: "object", properties: { instagram_url: { type: "string" }, pixieset_url: { type: "string" }, likes: { type: "string" }, dislikes: { type: "string" }, contact_name: { type: "string" }, contact_phone: { type: "string" }, notes: { type: "string" }, logo_url: { type: "string" } } } }, required: ["cliente", "campi"] } },
  { name: "modifica_persona", description: "Aggiorna telefono o email di una persona del team, oppure aggiunge una persona nuova se non esiste.", input_schema: { type: "object", properties: { persona: { type: "string" }, phone: { type: "string" }, email: { type: "string" } }, required: ["persona"] } },
  { name: "pubblica_in_bacheca", description: "Pubblica una richiesta in bacheca per i collaboratori.", input_schema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, date: { type: "string" }, operator_fee: { type: "number" }, event_id: { type: "string" } }, required: ["title"] } },
  { name: "richiesta_app", description: "Salva una richiesta di modifica o nuova funzione dell'app (non dei dati): la sviluppa Claude nella prossima sessione con Riky.", input_schema: { type: "object", properties: { testo: { type: "string" } }, required: ["testo"] } },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser(auth.replace("Bearer ", ""));
    if (!u?.user) return json({ error: "Non autenticato" }, 401);
    const { data: me } = await sb.from("profiles").select("*").eq("user_id", u.user.id).single();
    if (!me) return json({ error: "Profilo non trovato" }, 403);
    const { message } = await req.json();
    if (!message || typeof message !== "string") return json({ error: "Messaggio vuoto" }, 400);
    await sb.from("chat_messages").insert({ profile_id: me.id, role: "user", content: message.slice(0, 4000) });

    const reply = async (text: string) => { await sb.from("chat_messages").insert({ profile_id: me.id, role: "assistant", content: text }); return json({ reply: text }); };

    if (me.role !== "admin") {
      await sb.from("app_requests").insert({ profile_id: me.id, text: message });
      return reply("Ho girato il messaggio a Riky.");
    }
    const KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!KEY) {
      await sb.from("app_requests").insert({ profile_id: me.id, text: message });
      return reply("L'assistente non è ancora attivo (manca la chiave API di Claude). Ho salvato la richiesta: la vedo appena apri Claude e la sistemo da lì.");
    }

    const today = iso(new Date());
    const [{ data: people }, { data: clients }, { data: formats }] = await Promise.all([
      sb.from("profiles").select("id,name,role,phone,email").eq("active", true),
      sb.from("clients").select("id,name,venue"),
      sb.from("formats").select("name,venue,weekday,start_time,end_time,photos,stories,video,fee,client_id"),
    ]);
    const findPerson = (n?: string) => n ? (people ?? []).find((p) => p.name.toLowerCase() === n.toLowerCase().trim()) ?? (people ?? []).find((p) => p.name.toLowerCase().startsWith(n.toLowerCase().trim())) : undefined;

    async function events(da: string, a: string) {
      const { data: evs } = await sb.from("events").select("*").gte("date", da).lte("date", a).order("date");
      const ids = (evs ?? []).map((e) => e.id);
      if (!ids.length) return [];
      const [{ data: asg }, { data: del }, { data: fin }] = await Promise.all([
        sb.from("assignments").select("*").in("event_id", ids),
        sb.from("deliverables").select("*").in("event_id", ids),
        sb.from("event_finance").select("*").in("event_id", ids),
      ]);
      const pn = (id: string) => (people ?? []).find((p) => p.id === id)?.name;
      return (evs ?? []).map((e) => ({
        id: e.id, data: e.date, nome: e.name, locale: e.venue, orario: [e.start_time, e.end_time].filter(Boolean).join("-"), stato: e.status,
        foto: e.photos, storie: e.stories, video: e.video, edit_riky: e.edit_by_riky, note: e.notes,
        compenso: fin?.find((f) => f.event_id === e.id)?.fee ?? null, cliente_pagato: fin?.find((f) => f.event_id === e.id)?.client_paid ?? false,
        operatori: (asg ?? []).filter((x) => x.event_id === e.id).map((x) => ({ nome: pn(x.profile_id), quota: x.operator_fee, pagato: x.operator_paid })),
        consegne: (del ?? []).filter((d) => d.event_id === e.id).map((d) => ({ id: d.id, tipo: d.type, a: pn(d.assignee_id), scadenza: d.due_date, fatta: !!d.delivered_at, link: d.link })),
      }));
    }

    async function runTool(name: string, i: any): Promise<unknown> {
      const chk = (r: { error: any }) => { if (r.error) throw new Error(r.error.message); };
      switch (name) {
        case "cerca_serate": return await events(i.da, i.a);
        case "modifica_serata": {
          const { fee, ...campi } = i.campi ?? {};
          if (Object.keys(campi).length) chk(await sb.from("events").update(campi).eq("id", i.id));
          if (fee !== undefined) chk(await sb.from("event_finance").upsert({ event_id: i.id, fee }));
          return "ok";
        }
        case "crea_serata": {
          const f = (formats ?? []).find((x) => x.name.toLowerCase() === String(i.name).toLowerCase());
          const row = { name: i.name, date: i.date, venue: i.venue ?? f?.venue ?? null, start_time: i.start_time ?? f?.start_time ?? null, end_time: i.end_time ?? f?.end_time ?? null, photos: i.photos ?? f?.photos ?? null, stories: i.stories ?? f?.stories ?? null, video: i.video ?? f?.video ?? null, client_id: f?.client_id ?? null, edit_by_riky: !!i.edit_by_riky, notes: i.notes ?? null };
          const r = await sb.from("events").insert(row).select().single(); chk(r);
          const eid = r.data.id;
          chk(await sb.from("event_finance").insert({ event_id: eid, fee: i.fee ?? f?.fee ?? null }));
          const op = findPerson(i.operatore);
          if (op) chk(await sb.from("assignments").insert({ event_id: eid, profile_id: op.id }));
          const dues = [];
          if (row.photos) dues.push({ event_id: eid, type: "foto", due_date: addDays(i.date, 3), assignee_id: op?.id ?? null });
          if (String(row.video ?? "").includes("clip")) dues.push({ event_id: eid, type: "clip", due_date: i.date, assignee_id: op?.id ?? null });
          if (String(row.video ?? "").includes("reel")) dues.push({ event_id: eid, type: "reel", due_date: addDays(i.date, 5), assignee_id: op?.id ?? null });
          if (dues.length) chk(await sb.from("deliverables").insert(dues));
          return { id: eid, operatore: op?.name ?? null, consegne: dues.map((d) => d.type) };
        }
        case "assegna": {
          const p = findPerson(i.persona); if (!p) return `Persona "${i.persona}" non trovata`;
          chk(await sb.from("assignments").insert({ event_id: i.event_id, profile_id: p.id, ...(i.operator_fee != null ? { operator_fee: i.operator_fee } : {}) }));
          await sb.from("deliverables").update({ assignee_id: p.id }).eq("event_id", i.event_id).is("assignee_id", null);
          return "ok";
        }
        case "togli": {
          const p = findPerson(i.persona); if (!p) return `Persona "${i.persona}" non trovata`;
          chk(await sb.from("assignments").delete().eq("event_id", i.event_id).eq("profile_id", p.id)); return "ok";
        }
        case "aggiungi_consegna": {
          const { data: e } = await sb.from("events").select("date").eq("id", i.event_id).single();
          const p = findPerson(i.persona);
          const due = i.scadenza ?? (e ? addDays(e.date, i.tipo === "foto" ? 3 : i.tipo === "reel" ? 5 : 0) : null);
          chk(await sb.from("deliverables").insert({ event_id: i.event_id, type: i.tipo, due_date: due, assignee_id: p?.id ?? null, label: i.label ?? null }));
          return "ok";
        }
        case "segna_consegna": {
          const patch: Record<string, unknown> = {};
          if (i.fatta !== undefined) patch.delivered_at = i.fatta ? new Date().toISOString() : null;
          if (i.link !== undefined) patch.link = i.link;
          chk(await sb.from("deliverables").update(patch).eq("id", i.deliverable_id)); return "ok";
        }
        case "segna_pagamento": {
          if (i.cliente_pagato !== undefined) chk(await sb.from("event_finance").upsert({ event_id: i.event_id, client_paid: i.cliente_pagato, client_paid_at: i.cliente_pagato ? today : null }));
          if (i.persona) { const p = findPerson(i.persona); if (!p) return `Persona "${i.persona}" non trovata`; chk(await sb.from("assignments").update({ operator_paid: !!i.operatore_pagato, operator_paid_at: i.operatore_pagato ? today : null }).eq("event_id", i.event_id).eq("profile_id", p.id)); }
          return "ok";
        }
        case "modifica_cliente": {
          const c = (clients ?? []).find((x) => x.name.toLowerCase().includes(String(i.cliente).toLowerCase()) || (x.venue ?? "").toLowerCase() === String(i.cliente).toLowerCase());
          if (!c) { const r = await sb.from("clients").insert({ name: i.cliente, ...i.campi }).select().single(); chk(r); return "cliente creato"; }
          chk(await sb.from("clients").update(i.campi).eq("id", c.id)); return "ok";
        }
        case "modifica_persona": {
          const p = findPerson(i.persona);
          const patch: Record<string, unknown> = {}; if (i.phone) patch.phone = i.phone; if (i.email) patch.email = i.email;
          if (!p) { chk(await sb.from("profiles").insert({ name: i.persona, initials: String(i.persona)[0].toUpperCase(), ...patch })); return "persona aggiunta"; }
          chk(await sb.from("profiles").update(patch).eq("id", p.id)); return "ok";
        }
        case "pubblica_in_bacheca": chk(await sb.from("board_posts").insert({ title: i.title, description: i.description ?? null, date: i.date ?? null, operator_fee: i.operator_fee ?? null, event_id: i.event_id ?? null })); return "ok";
        case "richiesta_app": chk(await sb.from("app_requests").insert({ profile_id: me.id, text: i.testo })); return "salvata";
      }
      return "strumento sconosciuto";
    }

    const upcoming = await events(addDays(today, -7), addDays(today, 21));
    const { data: hist } = await sb.from("chat_messages").select("role,content").eq("profile_id", me.id).order("created_at", { ascending: false }).limit(13);
    const msgs: any[] = (hist ?? []).reverse().map((m) => ({ role: m.role, content: m.content }));
    while (msgs.length && msgs[0].role !== "user") msgs.shift();

    const system = `Sei l'assistente di Studio Zero, agenzia di foto/video per serate in discoteca gestita da ${me.name}. Oggi è ${today} (fuso Europe/Rome). Le serate dopo mezzanotte appartengono alla data della sera prima.
Rispondi in italiano, breve e diretto, come in chat. Quando ${me.name} ti dice una cosa da cambiare, usa gli strumenti e poi conferma in una riga cosa hai fatto. Se un'informazione è ambigua (es. due serate con lo stesso nome) chiedi prima di modificare. Non inventare dati.
Se chiede una modifica o una funzione nuova dell'APP (grafica, pulsanti, schermate), salvala con richiesta_app e digli che la sviluppi nella prossima sessione su Claude.
Regole: consegne clip la sera stessa, foto entro 3 giorni, reel entro 5. Quota: se l'edit lo fa Riky trattiene 50 €, il resto all'operatore.
Team: ${(people ?? []).map((p) => p.name + (p.role === "admin" ? " (admin)" : "")).join(", ")}.
Clienti: ${(clients ?? []).map((c) => c.name + (c.venue ? " @" + c.venue : "")).join("; ")}.
Format fissi: ${(formats ?? []).map((f) => `${f.name} (giorno ${f.weekday}, ${f.venue ?? ""}, ${f.fee ?? "?"}€, ${f.video ?? ""})`).join("; ")}.
Serate da ${addDays(today, -7)} a ${addDays(today, 21)}: ${JSON.stringify(upcoming)}`;

    let final = "";
    for (let step = 0; step < 8; step++) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 1500, system, tools: TOOLS, messages: msgs }),
      });
      const data = await r.json();
      if (!r.ok) return reply("Errore dell'assistente: " + (data?.error?.message ?? r.status));
      msgs.push({ role: "assistant", content: data.content });
      const uses = data.content.filter((c: any) => c.type === "tool_use");
      if (!uses.length) { final = data.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n").trim(); break; }
      const results = [];
      for (const t of uses) {
        let out: unknown;
        try { out = await runTool(t.name, t.input); } catch (e) { out = "Errore: " + (e as Error).message; }
        results.push({ type: "tool_result", tool_use_id: t.id, content: JSON.stringify(out) });
      }
      msgs.push({ role: "user", content: results });
    }
    return reply(final || "Fatto.");
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
