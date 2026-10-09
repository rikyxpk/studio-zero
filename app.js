import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const sb = createClient('https://pcdffiypzyyjabnuhija.supabase.co', 'sb_publishable_mIOt0cLDz6Sv0eG5UypdTw_3-zOxvA8');

// ---------- icone ----------
const sv = (p, s = 26, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ic = {
  home: sv('<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  cal: sv('<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>', 22, 2.2),
  team: sv('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16.5 14.2c2.6.2 4.4 2 5 4.8"/>'),
  cam: sv('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>'),
  board: sv('<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9.5h8M8 12.5h5"/>'),
  money: sv('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>'),
  back: sv('<path d="M15 18l-6-6 6-6"/>', 20, 2),
  ig: sv('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>', 20),
  album: sv('<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5-8 9"/>', 20),
  wa: sv('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.3 2 2 3.8 4.5 4.5l1-1.2 2 .8c-.2 1.2-1.2 2-2.4 1.8C10.7 15 8.5 12.8 8 9.5 7.9 8.4 8.6 7.4 9.8 7.3l.8 2z"/>', 20),
  chev: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--muted);flex-shrink:0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>`,
  out: sv('<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H4"/>', 20),
  chat: sv('<path d="M4 5h16v11H9l-5 4z"/><circle cx="9" cy="10.5" r=".6" fill="currentColor"/><circle cx="12" cy="10.5" r=".6" fill="currentColor"/><circle cx="15" cy="10.5" r=".6" fill="currentColor"/>', 20),
  mic: sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>', 22),
  send: sv('<path d="M4 12l16-8-6 16-2.5-6.5z"/>', 22),
  refresh: sv('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', 20)
};

const PERMS = [['ig', 'Credenziali Instagram dei locali'], ['wt', 'Account WeTransfer'], ['adobe', 'Account Adobe'], ['capcut', 'Account CapCut'], ['faceapp', 'Account FaceApp'], ['fees', 'Compensi dei clienti']];
const SERVICE_NAMES = { ig: 'Instagram locali', wt: 'WeTransfer', adobe: 'Adobe', capcut: 'CapCut', faceapp: 'FaceApp' };
const PROFILE_GROUPS = [
  ['qualities', 'Qualità', ['fotografo', 'videomaker', 'dronista', 'editor']],
  ['gear', 'Attrezzatura', ['Sony', 'Canon', 'Nikon', 'Fujifilm']],
  ['lenses', 'Ottiche', ['16-35', '24-70', '70-200', '35mm', '50mm', '85mm']],
  ['accessories', 'Accessori', ['Trigger', 'Faretto', 'Flash', 'Gimbal', 'Insta360', 'Drone']],
  ['availability', 'Disponibilità', ['Sera', 'Weekend', 'Infrasettimanale', 'Solo un giorno a settimana']]
];
const TYPE_LABEL = { foto: 'Foto', clip: 'Clip', reel: 'Reel' };

// ---------- stato ----------
const S = { chat: [], chatBusy: false, listening: false, tab: 'home', filter: 'open', evSeg: 'next', meSeg: 'jobs', job: null, sheet: null, toast: null, mode: 'login', err: null, busy: false };
let D = null; // dati
let session = null;

// ---------- utilità ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = n => String(n).padStart(2, '0');
const isoLocal = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
function nightToday() { const n = new Date(); if (n.getHours() < 6) n.setDate(n.getDate() - 1); return isoLocal(n); }
const TODAY = () => isoLocal(new Date());
const diffDays = (a, b) => Math.round((parseD(a) - parseD(b)) / 864e5);
const DOW = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const fmtShort = s => { const d = parseD(s); return `${DOW[d.getDay()].toLowerCase()} ${d.getDate()}`; };
const fmtLong = s => parseD(s).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, c => c.toUpperCase());
const hm = t => t ? t.slice(0, 5) : '';
const timeTxt = e => e.start_time ? hm(e.start_time) + (e.end_time ? '–' + hm(e.end_time) : '') : 'orario da definire';
const eur = n => n == null ? '–' : (Math.round(n * 100) / 100).toLocaleString('it-IT') + ' €';
const url = u => { if (!u) return null; return /^https?:\/\//i.test(u) ? u : 'https://' + u; };
const waLink = (phone, text) => { const p = String(phone || '').replace(/\D/g, ''); if (!p) return null; const n = p.length <= 10 ? '39' + p : p; return `https://wa.me/${n}?text=${encodeURIComponent(text)}`; };

const isAdmin = () => D?.me?.role === 'admin';
const can = k => isAdmin() || !!D?.me?.perms?.[k];
const person = id => D.people.find(p => p.id === id);
const ev = id => D.events.find(e => e.id === id);
const client = id => D.clients.find(c => c.id === id);
const fin = id => D.fin.find(f => f.event_id === id);
const opsOf = eid => D.asg.filter(a => a.event_id === eid);
const opsTxt = e => { const o = opsOf(e.id).map(a => person(a.profile_id)?.name).filter(Boolean); return o.length ? o.join(' + ') : 'Libero'; };
const initials = p => p?.initials || (p?.name || '?')[0].toUpperCase();
const avatar = (p, cls = '') => `<span class="avatar ${cls}" style="background:${esc(p?.color || 'var(--accent)')}">${esc(initials(p))}</span>`;
function dStatus(d) { if (d.delivered_at) return 'done'; if (d.due_date && d.due_date < TODAY()) return 'late'; return 'open'; }
const dDays = d => d.due_date ? diffDays(d.due_date, TODAY()) : null;
const dayColor = d => { const st = dStatus(d), n = dDays(d); return st === 'done' ? 'var(--ok)' : st === 'late' ? 'var(--bad)' : n <= 1 ? 'var(--bad)' : n <= 2 ? 'var(--warn)' : 'var(--fg)'; };
const dName = d => `${ev(d.event_id)?.name || ''} – ${TYPE_LABEL[d.type]}${d.label ? ' (' + d.label + ')' : ''}`;
const sortDel = list => list.slice().sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'));
const serviceTxt = e => [e.photos ? e.photos + ' foto' : null, e.stories ? e.stories + ' storie' : null, e.video ? TYPE_LABEL[e.video] : null].filter(Boolean).join(' · ') || '–';

// ---------- dati ----------
async function load() {
  const from = new Date(); from.setDate(from.getDate() - 45);
  const fromS = isoLocal(from);
  const q = (t, f) => f(sb.from(t).select('*'));
  const [people, events, finance, asg, del, posts, offers, clients, notes, formats] = await Promise.all([
    q('profiles', x => x.order('name')),
    q('events', x => x.gte('date', fromS).order('date').order('start_time')),
    q('event_finance', x => x),
    q('assignments', x => x),
    q('deliverables', x => x),
    q('board_posts', x => x.order('created_at', { ascending: false })),
    q('board_offers', x => x),
    q('clients', x => x.order('name')),
    q('access_notes', x => x),
    q('formats', x => x.order('weekday'))
  ]);
  const err = [people, events, finance, asg, del, posts, offers, clients, notes, formats].find(r => r.error);
  if (err) throw err.error;
  const evIds = new Set(events.data.map(e => e.id));
  D = {
    me: people.data.find(p => p.user_id === session.user.id),
    people: people.data, events: events.data, fin: finance.data,
    asg: asg.data.filter(a => evIds.has(a.event_id)),
    del: del.data.filter(d => evIds.has(d.event_id)),
    posts: posts.data, offers: offers.data, clients: clients.data, notes: notes.data, formats: formats.data
  };
}
async function refresh(msg) { try { await load(); if (msg) toast(msg); else render(); } catch (e) { toast('Errore: ' + (e.message || e)); } }
async function run(p, msg) { const { error } = await p; if (error) { toast('Errore: ' + error.message); return false; } await refresh(msg); return true; }

// ---------- login ----------
function loginView() {
  const m = S.mode;
  const title = m === 'signup' ? 'Primo accesso' : m === 'reset' ? 'Recupera password' : m === 'newpass' ? 'Nuova password' : 'Entra';
  return `<form class="login" id="loginform">
    <div class="brandlogo" role="img" aria-label="Studio Zero"><i class="lw"></i><i class="lr"></i></div>
    <h1 class="h1">${title}</h1>
    ${m === 'signup' ? '<div class="note">Scrivi l’email o il numero che hai dato a Riky e scegli una password. Ti arriva una mail per confermare (serve solo la prima volta).</div>' : ''}
    ${m !== 'newpass' ? `<label class="f" for="lg-e">${m === 'reset' ? 'Email' : 'Email o numero di telefono'}<input id="lg-e" type="${m === 'reset' ? 'email' : 'text'}" autocomplete="username" autocapitalize="off" required></label>` : ''}
    ${m !== 'reset' ? `<label class="f" for="lg-p">Password<input id="lg-p" type="password" autocomplete="${m === 'login' ? 'current-password' : 'new-password'}" minlength="6" required></label>` : ''}
    ${S.err ? `<div class="err" role="alert">${esc(S.err)}</div>` : ''}
    <button class="btn" type="submit" ${S.busy ? 'disabled' : ''}>${m === 'signup' ? 'Crea account' : m === 'reset' ? 'Mandami il link' : m === 'newpass' ? 'Salva password' : 'Entra'}</button>
    ${m === 'login' ? '<button type="button" class="linkbtn" data-act="mode" data-id="signup">Primo accesso? Crea la tua password</button><button type="button" class="linkbtn" data-act="mode" data-id="reset">Password dimenticata</button>' : m !== 'newpass' ? '<button type="button" class="linkbtn" data-act="mode" data-id="login">Torna ad Entra</button>' : ''}
  </form>`;
}
async function submitLogin() {
  let e = document.getElementById('lg-e')?.value.trim(); const p = document.getElementById('lg-p')?.value;
  S.busy = true; S.err = null; render();
  let r;
  if (e && !e.includes('@') && S.mode !== 'newpass') {
    const { data } = await sb.rpc('login_email', { ident: e });
    if (!data) { S.busy = false; S.err = 'Numero non trovato nel team, oppure al tuo profilo manca l’email. Chiedi a Riky.'; render(); return; }
    e = data;
  }
  if (S.mode === 'login') r = await sb.auth.signInWithPassword({ email: e, password: p });
  else if (S.mode === 'signup') {
    r = await sb.auth.signUp({ email: e, password: p, options: { emailRedirectTo: location.origin } });
    if (!r.error && !r.data.session) { S.busy = false; S.mode = 'login'; S.err = null; toast('Controlla la mail e conferma, poi entra.'); return; }
  } else if (S.mode === 'reset') {
    r = await sb.auth.resetPasswordForEmail(e, { redirectTo: location.origin });
    if (!r.error) { S.busy = false; S.mode = 'login'; toast('Ti ho mandato il link per la nuova password.'); return; }
  } else if (S.mode === 'newpass') {
    r = await sb.auth.updateUser({ password: p });
    if (!r.error) { S.mode = 'login'; S.busy = false; toast('Password aggiornata.'); boot(); return; }
  }
  S.busy = false;
  if (r?.error) { S.err = r.error.message === 'Invalid login credentials' ? 'Email o password sbagliate.' : r.error.message; render(); }
}

// ---------- pezzi comuni ----------
function deliveryRows(list, act = 'deliv') {
  return list.map(d => { const st = dStatus(d), n = dDays(d); const p = person(d.assignee_id);
    return `<button class="rowbtn" data-act="${act}" data-id="${act === 'cjob' ? d.event_id : d.id}">
    <span class="days" style="color:${dayColor(d)}">${st === 'done' ? '✓' : st === 'late' ? '!' : n}<small>${st === 'done' ? 'fatto' : st === 'late' ? 'ritardo' : n === 1 ? 'giorno' : 'giorni'}</small></span>
    <span class="grow"><span class="t1">${esc(dName(d))}</span><span class="t2">${act === 'deliv' ? esc(p?.name || 'Nessuno') + ' · ' : ''}${st === 'done' ? 'consegnato' : d.due_date ? 'entro ' + fmtShort(d.due_date) : 'senza scadenza'}</span></span>${ic.chev}</button>`; }).join('');
}
function refs(e) {
  const c = client(e.client_id) || {};
  const alb = url(e.pixieset_prev_url || c.pixieset_url), insta = url(e.instagram_url || c.instagram_url);
  const b = (u, i, t) => u ? `<a class="filterchip" style="height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:8px" href="${esc(u)}" target="_blank" rel="noopener">${i}${t}</a>` : `<span class="filterchip" style="height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:8px;opacity:.45">${i}${t}</span>`;
  return `<div style="display:flex;gap:8px;flex-wrap:wrap">${b(alb, ic.album, 'Album precedente')}${b(insta, ic.ig, 'Instagram')}</div>`;
}
function notesList() {
  const n = D.notes;
  if (!n.length) return '<div class="empty">Nessun accesso condiviso.</div>';
  return n.map(x => `<div class="row" style="align-items:flex-start"><div class="grow"><span class="t1">${esc(x.title)}</span><span class="t2">${esc(SERVICE_NAMES[x.service] || x.service)}${x.client_id ? ' · ' + esc(client(x.client_id)?.name) : ''}</span>${x.instructions ? `<span style="font-size:14px;margin-top:4px;white-space:pre-wrap">${esc(x.instructions)}</span>` : ''}</div></div>`).join('');
}

// ---------- ADMIN ----------
function adminHome() {
  const all = D.del; const f = S.filter;
  const open = all.filter(d => dStatus(d) === 'open'), late = all.filter(d => dStatus(d) === 'late'), done = all.filter(d => dStatus(d) === 'done');
  const free = D.events.filter(e => e.date >= TODAY() && e.status !== 'saltata' && !opsOf(e.id).length);
  const list = sortDel(f === 'open' ? open : f === 'late' ? late : f === 'done' ? done.slice().sort((a, b) => b.delivered_at.localeCompare(a.delivered_at)) : all.filter(d => dStatus(d) !== 'done'));
  const label = { open: 'Consegne aperte', late: 'In ritardo', done: 'Consegnate', all: 'Da fare' }[f];
  const st = (key, num, color, txt) => `<button class="stat${f === key ? ' on' : ''}" data-act="filter" data-id="${key}" aria-pressed="${f === key}"><b style="color:${color}">${num}</b><span>${txt}</span></button>`;
  const tn = nightToday();
  const tonight = D.events.filter(e => e.date === tn && e.status !== 'saltata');
  const due = (D.fin.filter(x => { const e = ev(x.event_id); return e && !x.client_paid && x.fee && e.date <= TODAY() && e.status !== 'saltata'; })).reduce((s, x) => s + Number(x.fee), 0);
  const owe = D.asg.filter(a => { const e = ev(a.event_id), p = person(a.profile_id); return e && p && !p.is_owner && !a.operator_paid && a.operator_fee && e.date <= TODAY() && e.status !== 'saltata'; }).reduce((s, a) => s + Number(a.operator_fee), 0);
  return `<div class="pad"><div class="date">${fmtLong(TODAY())}</div></div>
  <div class="pad" style="padding-top:10px"><div class="eyebrow">Stasera</div>
    ${tonight.map(e => `<button class="rowbtn tonight" data-act="ev" data-id="${e.id}" style="align-items:baseline"><span style="font-family:var(--display);font-weight:900;font-size:24px">${esc((e.venue || e.name).toUpperCase())}</span><span style="font-size:15px;color:var(--soft);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.venue ? e.name : '')}</span><span style="margin-left:auto;text-align:right;display:flex;flex-direction:column;flex-shrink:0"><span class="t1">${esc(opsTxt(e))}</span><span class="t2">${timeTxt(e)}</span></span></button>`).join('') || '<div class="empty" style="padding:14px 0;text-align:left">Nessuna serata stasera.</div>'}
  </div>
  <div class="stats">
    ${st('open', open.length, 'var(--accent)', 'consegne aperte')}
    ${st('late', late.length, late.length ? 'var(--bad)' : 'var(--ok)', 'in ritardo')}
    ${st('done', done.length, 'var(--fg)', 'consegnate')}
    <button class="stat" data-act="free"><b style="color:${free.length ? 'var(--warn)' : 'var(--ok)'}">${free.length}</b><span>serate da assegnare</span></button>
  </div>
  <div class="sechead"><h2 class="h2">${label}</h2>${f !== 'all' ? '<button class="filterchip" data-act="filter" data-id="all">Mostra tutte</button>' : '<span class="t2">giorni rimasti</span>'}</div>
  <div class="pad">${deliveryRows(list) || `<div class="empty">${f === 'late' ? 'Nessuna consegna in ritardo.' : 'Niente da mostrare.'}</div>`}</div>
  <div class="sechead"><h2 class="h2">Soldi in giro</h2></div>
  <div class="pad grid2" style="padding-top:6px;padding-bottom:20px">
    <div><div style="font-family:var(--display);font-weight:900;font-size:30px;color:var(--warn)">${eur(due)}</div><div class="t2">da incassare dai clienti</div></div>
    <div><div style="font-family:var(--display);font-weight:900;font-size:30px;color:var(--warn)">${eur(owe)}</div><div class="t2">da dare agli operatori</div></div>
  </div>`;
}

function eventRows(list) {
  return list.map(e => { const d = parseD(e.date); const sk = e.status === 'saltata'; const o = opsOf(e.id).length;
    return `<button class="rowbtn" data-act="ev" data-id="${e.id}" style="${sk ? 'opacity:.55' : ''}">
    <span class="date-b"><span>${DOW[d.getDay()]}</span><b>${d.getDate()}</b></span>
    <span class="grow"><span class="t1">${esc(e.name)}</span><span class="t2">${esc(e.venue || '–')} · ${timeTxt(e)}</span></span>
    <span class="pill${sk ? ' bad' : e.status === 'da_confermare' ? ' mute' : o ? '' : ' warn'}">${sk ? 'Saltata' : e.status === 'da_confermare' ? 'Da confermare' : esc(opsTxt(e))}</span></button>`; }).join('');
}
function adminEvents() {
  const segs = [['next', 'Prossime'], ['free', 'Da assegnare'], ['past', 'Passate'], ['board', 'Bacheca']];
  const seg = `<div class="seg">${segs.map(([k, l]) => `<button class="${S.evSeg === k ? 'on' : ''}" data-act="evseg" data-id="${k}">${l}</button>`).join('')}</div>`;
  if (S.evSeg === 'board') return seg + boardAdmin();
  const t = nightToday();
  let list = S.evSeg === 'past' ? D.events.filter(e => e.date < t).reverse() : D.events.filter(e => e.date >= t);
  if (S.evSeg === 'free') list = list.filter(e => e.status !== 'saltata' && !opsOf(e.id).length);
  return seg + `<div class="pad">${eventRows(list) || `<div class="empty">${S.evSeg === 'free' ? 'Tutte le serate sono assegnate.' : 'Nessuna serata.'}</div>`}</div>`;
}

function boardAdmin() {
  const posts = D.posts.filter(p => p.status !== 'chiusa');
  return `<div class="pad stack" style="padding-top:8px"><div class="note">Richieste extra visibili a tutti. Chi vuole si propone, poi scegli tu.</div>
  ${posts.map(p => { const offers = D.offers.filter(o => o.post_id === p.id);
    return `<div class="block" style="gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span class="t1" style="font-size:16px">${esc(p.title)}</span><span class="t2">${p.date ? fmtShort(p.date) : ''}</span></div>
    ${p.description ? `<div style="font-size:14px;color:var(--soft)">${esc(p.description)}</div>` : ''}
    ${p.operator_fee ? `<div class="t2">Cachet: ${eur(p.operator_fee)}</div>` : ''}
    ${p.status === 'assegnata' ? `<div class="pill ok" style="align-self:flex-start">Assegnato a ${esc(person(p.chosen_id)?.name)}</div>` : `<div class="k">${offers.length ? 'Si sono proposti' : 'Ancora nessuno si è proposto'}</div><div class="chips">${offers.map(o => `<button class="chip" data-act="pick" data-id="${p.id}" data-k="${o.profile_id}">Scegli ${esc(person(o.profile_id)?.name)}</button>`).join('')}</div>`}
    <button class="filterchip" style="align-self:flex-start" data-act="closepost" data-id="${p.id}">Chiudi richiesta</button></div>`; }).join('') || '<div class="empty">Nessuna richiesta aperta.</div>'}
  <button class="btn ghost" data-act="newpost">+ Pubblica una richiesta</button></div>`;
}

function adminTeam() {
  return `<div class="pad"><h2 class="h2" style="padding-top:4px">Team</h2><div class="note" style="padding-top:4px">Tocca un operatore per la scheda, il ruolo e cosa può vedere.</div></div>
  <div class="pad">${D.people.filter(p => p.active).map(p => `<button class="rowbtn" data-act="person" data-id="${p.id}">
    ${avatar(p, 'mid')}
    <span class="grow"><span class="t1">${esc(p.name)}</span><span class="t2">${esc((p.qualities || []).join(' · ') || p.level || '')}${p.user_id ? '' : ' · <span style="color:var(--warn)">non ha ancora l’accesso</span>'}</span></span>
    ${p.role === 'admin' ? '<span class="pill warn">Admin</span>' : ''}${ic.chev}</button>`).join('')}
    <div style="padding:16px 0"><button class="btn ghost" data-act="newperson">+ Aggiungi operatore</button></div></div>`;
}

function personSheet(id) {
  const p = person(id); const perms = p.perms || {};
  const jobs = D.events.filter(e => e.date >= nightToday() && opsOf(e.id).some(a => a.profile_id === id));
  const row = (k, arr) => `<div><div class="k">${k}</div><div class="v" style="font-weight:500">${esc((arr || []).join(', ') || '–')}</div></div>`;
  return `<div class="grab"></div>
  <div style="display:flex;gap:14px;align-items:center">${avatar(p, 'big')}<div class="grow"><h2 class="h1" style="font-size:26px">${esc(p.name)}</h2><span class="t2">${esc(p.level || '')}</span></div></div>
  <div class="grid2">${row('Qualità', p.qualities)}${row('Disponibilità', p.availability)}${row('Attrezzatura', p.gear)}${row('Ottiche', p.lenses)}${row('Accessori', p.accessories)}</div>
  <div class="block"><div class="k">Prossime serate</div><div style="font-size:14px">${jobs.length ? jobs.map(e => esc(fmtShort(e.date) + ' · ' + e.name)).join('<br>') : 'Nessuna serata'}</div></div>
  <form id="personform" data-id="${p.id}" class="stack" style="gap:10px">
    <label class="f" for="pf-e">Email per l’accesso<input id="pf-e" type="email" value="${esc(p.email || '')}" placeholder="email@esempio.it" ${p.is_owner ? 'disabled' : ''}></label>
    <label class="f" for="pf-t">Telefono WhatsApp<input id="pf-t" type="tel" value="${esc(p.phone || '')}" placeholder="333 1234567"></label>
    <button class="btn ghost" type="submit">Salva email e telefono</button>
    ${!p.user_id && p.email ? `<div class="note">Dì a ${esc(p.name)} di aprire l’app, toccare “Primo accesso” e usare questa email.</div>` : ''}
  </form>
  ${p.is_owner ? '<div class="note">Sei il proprietario: vedi tutto e gestisci il team.</div>' : `
  <div class="block" style="gap:0"><div class="eyebrow" style="padding-bottom:4px">Ruolo</div>
    <div class="toggle"><span><span class="t1">Admin</span><br><span class="t2">Crea eventi, assegna serate, vede tutto</span></span><button class="sw${p.role === 'admin' ? ' on' : ''}" role="switch" aria-checked="${p.role === 'admin'}" aria-label="Admin" data-act="admin" data-id="${id}"></button></div>
  </div>
  <div class="block" style="gap:0"><div class="eyebrow" style="padding-bottom:4px">Può vedere</div>
    ${PERMS.map(([k, l]) => { const on = p.role === 'admin' || perms[k]; return `<div class="toggle"><span class="t1" style="font-weight:500">${l}</span><button class="sw${on ? ' on' : ''}" role="switch" aria-checked="${!!on}" aria-label="${l}" data-act="perm" data-id="${id}" data-k="${k}" ${p.role === 'admin' ? 'disabled style="opacity:.5"' : ''}></button></div>`; }).join('')}
    ${p.role === 'admin' ? '<div class="note" style="padding-top:8px">Gli admin vedono tutto.</div>' : ''}
  </div>`}
  <button class="btn ghost" data-act="close">Chiudi</button>`;
}

function myJobs(pid) {
  if (S.job) return jobDetail(pid, ev(S.job));
  const mineIds = new Set(D.asg.filter(a => a.profile_id === pid).map(a => a.event_id).concat(D.del.filter(d => d.assignee_id === pid).map(d => d.event_id)));
  const t = nightToday();
  const mine = D.events.filter(e => mineIds.has(e.id));
  const next = mine.filter(e => e.date >= t);
  const pastOpen = mine.filter(e => e.date < t && D.del.some(d => d.event_id === e.id && d.assignee_id === pid && !d.delivered_at));
  const rows = l => l.map(e => { const d = parseD(e.date); return `<button class="rowbtn" data-act="job" data-id="${e.id}"><span class="date-b"><span>${DOW[d.getDay()]}</span><b>${d.getDate()}</b></span><span class="grow"><span class="t1">${esc(e.name)}</span><span class="t2">${esc(e.venue || '–')} · ${timeTxt(e)}${e.status === 'saltata' ? ' · <span style="color:var(--bad)">saltata</span>' : ''}</span></span>${ic.chev}</button>`; }).join('');
  return `<div class="pad">${pastOpen.length ? `<div class="eyebrow" style="padding-top:8px">Da consegnare</div>${rows(pastOpen.reverse())}<div class="eyebrow" style="padding-top:18px">Prossime</div>` : ''}${rows(next) || '<div class="empty">Nessuna serata in programma.</div>'}</div>`;
}

function jobDetail(pid, e) {
  if (!e) { S.job = null; return myJobs(pid); }
  const c = client(e.client_id) || {};
  const ds = D.del.filter(d => d.event_id === e.id && d.assignee_id === pid).sort((a, b) => a.type.localeCompare(b.type));
  const my = D.asg.find(a => a.event_id === e.id && a.profile_id === pid);
  const f = fin(e.id);
  const showFee = can('fees') && f;
  const others = opsOf(e.id).filter(a => a.profile_id !== pid).map(a => person(a.profile_id)?.name).filter(Boolean);
  const logo = url(c.logo_url);
  return `<div class="pad stack">
    <button class="back" data-act="closejob">${ic.back}I miei lavori</button>
    <div><div class="eyebrow">${fmtLong(e.date)}</div><h1 class="h1">${esc(e.name)}</h1><div class="t2" style="font-size:14px;padding-top:4px">${esc(e.venue || '–')} · ${timeTxt(e)}${others.length ? ' · con ' + esc(others.join(', ')) : ''}</div></div>
    ${e.status === 'saltata' ? '<div class="pill bad" style="align-self:flex-start">Serata saltata</div>' : ''}
    ${refs(e)}
    <div class="grid2"><div><div class="k">Foto</div><div class="v">${esc(e.photos || '–')}</div></div><div><div class="k">Storie</div><div class="v">${esc(e.stories || '–')}</div></div><div><div class="k">Video</div><div class="v">${e.video ? TYPE_LABEL[e.video] : '–'}</div></div><div><div class="k">Edit</div><div class="v">${e.edit_by_riky ? 'Lo fa Riky' : 'Lo fai tu'}</div></div></div>
    ${e.shots_tips || c.likes || c.dislikes ? `<div class="block"><div class="k">Cosa vogliono</div><div style="font-size:14px;color:var(--soft);white-space:pre-wrap">${esc([e.shots_tips, c.likes ? 'Piace: ' + c.likes : '', c.dislikes ? 'Da evitare: ' + c.dislikes : ''].filter(Boolean).join('\n'))}</div></div>` : ''}
    ${e.notes ? `<div class="block"><div class="k">Note</div><div style="font-size:14px;white-space:pre-wrap">${esc(e.notes)}</div></div>` : ''}
    ${c.contact_name || c.contact_phone ? `<div class="block"><div class="k">Referente</div><div style="font-size:14px">${esc(c.contact_name || '')}${c.contact_phone ? ` · <a href="tel:${esc(c.contact_phone)}" style="color:var(--fg)">${esc(c.contact_phone)}</a>` : ''}</div></div>` : ''}
    <div class="block"><div class="k">Instagram del locale</div><div style="font-size:14px">${can('ig') ? 'Istruzioni nella sezione Accessi' : 'Chiedi l’accesso a Riky'} · <span style="color:var(--warn)">storie da far approvare a Riky</span></div></div>
    <div class="block" style="flex-direction:row;justify-content:space-between;align-items:center;gap:10px"><div><div class="k">${showFee ? 'Compenso cliente' : 'Il tuo cachet'}</div><div style="font-family:var(--display);font-weight:900;font-size:24px">${showFee ? eur(f.fee) : eur(my?.operator_fee)}</div></div>${logo ? `<a class="filterchip" style="height:44px;padding:0 16px;display:inline-flex;align-items:center" href="${esc(logo)}" target="_blank" rel="noopener">Loghi PNG</a>` : ''}</div>
    ${ds.length ? `<div class="block" style="gap:12px"><div class="eyebrow">Consegne</div>${ds.map(d => { const st = dStatus(d), n = dDays(d); return `<div class="stack" style="gap:8px;padding-bottom:12px;border-bottom:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><span class="t1" style="font-size:16px">${TYPE_LABEL[d.type]}${d.label ? ' · ' + esc(d.label) : ''}</span><span class="t2" style="color:${dayColor(d)}">${st === 'done' ? 'consegnato' : d.due_date ? 'entro ' + fmtShort(d.due_date) + (st === 'late' ? '' : ' · ' + n + ' gg') : ''}</span></div>
      ${st === 'done' ? (d.link ? `<a class="t2" href="${esc(url(d.link))}" target="_blank" rel="noopener" style="word-break:break-all">${esc(d.link)}</a>` : '') : `<label class="f" for="wt-${d.id}">Link ${d.type === 'foto' ? 'Pixieset o WeTransfer' : 'WeTransfer'}<input id="wt-${d.id}" type="url" inputmode="url" placeholder="Incolla qui il link" autocomplete="off" value="${esc(d.link || '')}"></label>`}
      <button class="btn${st === 'done' ? ' done' : ''}" data-act="${st === 'done' ? 'undeliver' : 'deliver'}" data-id="${d.id}">${st === 'done' ? TYPE_LABEL[d.type] + ' consegnato ✓' : 'Consegna ' + TYPE_LABEL[d.type].toLowerCase()}</button></div>`; }).join('')}</div>` : ''}
  </div>`;
}

function adminMe() {
  const seg = `<div class="seg"><button class="${S.meSeg === 'jobs' ? 'on' : ''}" data-act="meseg" data-id="jobs">I miei lavori</button><button class="${S.meSeg === 'creds' ? 'on' : ''}" data-act="meseg" data-id="creds">Accessi</button><button class="${S.meSeg === 'acc' ? 'on' : ''}" data-act="meseg" data-id="acc">Account</button></div>`;
  if (S.meSeg === 'creds') return seg + `<div class="pad"><div class="note" style="padding:4px 0 6px">Istruzioni d’accesso agli account (mai le password). Decidi chi le vede dalla scheda di ognuno in Team.</div>${notesList()}</div>`;
  if (S.meSeg === 'acc') return seg + accountBlock();
  return seg + myJobs(D.me.id);
}
function accountBlock() {
  return `<div class="pad stack" style="padding-top:8px"><div class="t2">Sei entrato come ${esc(session.user.email)}</div>
  <button class="btn ghost" data-act="refresh">Aggiorna i dati</button>
  <button class="btn ghost" data-act="logout">Esci</button></div>`;
}

// ---------- COLLABORATORE ----------
function collabHome() {
  const pid = D.me.id; const mine = D.del.filter(d => d.assignee_id === pid);
  const open = mine.filter(d => !d.delivered_at);
  const t = nightToday();
  const nextEv = D.events.find(e => e.date >= t && e.status !== 'saltata' && opsOf(e.id).some(a => a.profile_id === pid));
  const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
  const nWeek = D.events.filter(e => e.date >= t && e.date <= isoLocal(weekEnd) && e.status !== 'saltata' && opsOf(e.id).some(a => a.profile_id === pid)).length;
  let when = '';
  if (nextEv) { const n = diffDays(nextEv.date, t); when = n === 0 ? 'stasera' : n === 1 ? 'domani' : fmtShort(nextEv.date); }
  const others = nextEv ? opsOf(nextEv.id).filter(a => a.profile_id !== pid).map(a => person(a.profile_id)?.name).filter(Boolean) : [];
  return `<div class="pad"><div class="date">${fmtLong(TODAY())} · ciao ${esc(D.me.name)}</div></div>
  <div class="pad" style="padding-top:10px"><div class="eyebrow">Prossima serata${when ? ' · ' + when : ''}</div>
    ${nextEv ? `<button class="rowbtn" data-act="cjob" data-id="${nextEv.id}" style="align-items:baseline"><span style="font-family:var(--display);font-weight:900;font-size:24px">${esc((nextEv.venue || nextEv.name).toUpperCase())}</span><span style="font-size:15px;color:var(--soft)">${esc(nextEv.venue ? nextEv.name : '')}${others.length ? ' · con ' + esc(others.join(', ')) : ''}</span><span class="t2" style="margin-left:auto;flex-shrink:0">${timeTxt(nextEv)}</span></button>` : '<div class="empty" style="padding:14px 0;text-align:left">Nessuna serata in programma.</div>'}
  </div>
  <div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">
    <div class="stat" style="cursor:default"><b>${nWeek}</b><span>serate nei prossimi 7 giorni</span></div>
    <div class="stat" style="cursor:default"><b style="color:var(--accent)">${open.length}</b><span>consegne da fare</span></div>
  </div>
  <div class="sechead"><h2 class="h2">Le tue consegne</h2><span class="t2">giorni rimasti</span></div>
  <div class="pad">${deliveryRows(sortDel(open), 'cjob') || '<div class="empty">Tutto consegnato.</div>'}</div>`;
}
function collabBoard() {
  const pid = D.me.id;
  const posts = D.posts.filter(p => p.status === 'aperta' || p.chosen_id === pid);
  return `<div class="pad stack"><h2 class="h2" style="padding-top:4px">Bacheca</h2><div class="note">Lavori extra: proponiti, poi Riky sceglie.</div>
  ${posts.map(p => { const mine = D.offers.some(o => o.post_id === p.id && o.profile_id === pid);
    return `<div class="block" style="gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span class="t1" style="font-size:16px">${esc(p.title)}</span><span class="t2">${p.date ? fmtShort(p.date) : ''}</span></div>
    ${p.description ? `<div style="font-size:14px;color:var(--soft)">${esc(p.description)}</div>` : ''}
    ${p.operator_fee ? `<div class="t2">Cachet: ${eur(p.operator_fee)}</div>` : ''}
    ${p.chosen_id === pid ? '<div class="pill ok" style="align-self:flex-start">Riky ha scelto te</div>' : `<button class="btn${mine ? ' done' : ''}" data-act="${mine ? 'unoffer' : 'offer'}" data-id="${p.id}">${mine ? 'Ti sei proposto · annulla' : 'Mi propongo'}</button>`}
    </div>`; }).join('') || '<div class="empty">Nessuna richiesta al momento.</div>'}</div>`;
}
function collabMoney() {
  const pid = D.me.id; const t = TODAY();
  const mine = D.asg.filter(a => a.profile_id === pid).map(a => ({ a, e: ev(a.event_id) })).filter(x => x.e && x.e.status !== 'saltata').sort((x, y) => y.e.date.localeCompare(x.e.date));
  const toGet = mine.filter(x => !x.a.operator_paid && x.e.date <= t && x.a.operator_fee).reduce((s, x) => s + Number(x.a.operator_fee), 0);
  const coming = mine.filter(x => x.e.date > t && x.a.operator_fee).reduce((s, x) => s + Number(x.a.operator_fee), 0);
  return `<div class="pad stack"><h2 class="h2" style="padding-top:4px">Soldi</h2>
  <div class="grid2"><div><div style="font-family:var(--display);font-weight:900;font-size:30px;color:var(--ok)">${eur(toGet)}</div><div class="t2">da ricevere per serate fatte</div></div><div><div style="font-family:var(--display);font-weight:900;font-size:30px">${eur(coming)}</div><div class="t2">serate in arrivo</div></div></div>
  <div>${mine.map(x => `<div class="row" style="justify-content:space-between"><span class="grow"><span class="t1" style="font-weight:500">${esc(x.e.name)}</span><span class="t2">${fmtShort(x.e.date)}</span></span><span style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px"><span class="t1">${x.a.operator_fee ? eur(x.a.operator_fee) : '<span class="t2">da definire</span>'}</span>${x.a.operator_paid ? '<span class="pill ok">pagato</span>' : x.e.date <= t ? '<span class="pill warn">da ricevere</span>' : ''}</span></div>`).join('') || '<div class="empty">Ancora niente.</div>'}</div></div>`;
}
function collabProfile() {
  const p = D.me;
  return `<div class="pad stack">
    <div style="display:flex;gap:14px;align-items:center;padding-top:4px">${avatar(p, 'big')}<div class="grow"><h2 class="h1" style="font-size:24px">${esc(p.name)}</h2><span class="t2">${esc((p.qualities || []).join(' · ') || 'Aggiungi le tue qualità')}</span></div></div>
    <div class="note">Tocca per selezionare. Riky lo usa per assegnarti i lavori giusti.</div>
    ${PROFILE_GROUPS.map(([col, t, base]) => { const sel = p[col] || []; const items = base.concat(sel.filter(x => !base.includes(x)));
      return `<div class="stack" style="gap:10px"><div class="eyebrow">${t}</div><div class="chips">${items.map(i => `<button class="chip${sel.includes(i) ? ' on' : ''}" aria-pressed="${sel.includes(i)}" data-act="sel" data-id="${esc(i)}" data-k="${col}">${esc(i)}</button>`).join('')}<button class="chip add" data-act="addsel" data-k="${col}">+ Aggiungi</button></div></div>`; }).join('')}
    <form id="phoneform" class="inline"><label class="f" for="me-t">Telefono WhatsApp<input id="me-t" type="tel" value="${esc(p.phone || '')}" placeholder="333 1234567"></label><button class="btn ghost" type="submit">Salva</button></form>
    ${D.notes.length ? `<div class="stack" style="gap:6px"><div class="eyebrow">Accessi condivisi con te</div>${notesList()}</div>` : ''}
    ${accountBlock().replace('class="pad stack"', 'class="stack"')}
  </div>`;
}

// ---------- schede dal basso ----------
function delivSheet(id) {
  const d = D.del.find(x => x.id === id); if (!d) return '';
  const e = ev(d.event_id); const p = person(d.assignee_id); const st = dStatus(d);
  const wa = p && !p.is_owner && st !== 'done' ? waLink(p.phone, `Ciao ${p.name}! Promemoria Studio Zero: ${dName(d)} da consegnare entro ${d.due_date ? fmtShort(d.due_date) : 'subito'}. Quando hai il link caricalo nell’app 🙏`) : null;
  return `<div class="grab"></div>
  <div><div class="eyebrow">${fmtLong(e.date)} · ${esc(e.venue || '')}</div><h2 class="h1" style="font-size:26px">${esc(dName(d))}</h2></div>
  <div class="grid2"><div><div class="k">Operatore</div><div class="v">${esc(p?.name || 'Nessuno')}</div></div><div><div class="k">Scadenza</div><div class="v" style="color:${dayColor(d)}">${st === 'done' ? 'Consegnato' : d.due_date ? fmtShort(d.due_date) + (st === 'late' ? ' · in ritardo' : ' · ' + dDays(d) + ' gg') : '–'}</div></div><div><div class="k">Servizio</div><div class="v">${esc(serviceTxt(e))}</div></div><div><div class="k">Orario serata</div><div class="v">${timeTxt(e)}</div></div></div>
  <label class="f" for="dl-l">Link consegna<input id="dl-l" type="url" value="${esc(d.link || '')}" placeholder="Non ancora caricato"></label>
  ${d.link ? `<a class="filterchip" style="align-self:flex-start;height:40px;display:inline-flex;align-items:center" href="${esc(url(d.link))}" target="_blank" rel="noopener">Apri il link</a>` : ''}
  <label class="f" for="dl-a">Assegnata a<select id="dl-a"><option value="">Nessuno</option>${D.people.filter(x => x.active).map(x => `<option value="${x.id}" ${x.id === d.assignee_id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
  <label class="f" for="dl-d">Scadenza<input id="dl-d" type="date" value="${d.due_date || ''}"></label>
  <button class="btn ghost" data-act="savedel" data-id="${d.id}">Salva modifiche</button>
  ${st === 'done' ? `<button class="btn done" data-act="undeliver" data-id="${d.id}">Consegnato ✓ · annulla</button>` : `<button class="btn" data-act="deliver" data-id="${d.id}" data-src="dl-l">Segna come consegnato</button>`}
  ${wa ? `<a class="btn ghost" style="display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none" href="${esc(wa)}" target="_blank" rel="noopener">${ic.wa}Promemoria WhatsApp a ${esc(p.name)}</a>` : p && !p.is_owner && st !== 'done' && !p.phone ? `<div class="note">Aggiungi il telefono di ${esc(p.name)} in Team per mandargli un promemoria su WhatsApp.</div>` : ''}
  <button class="btn ghost" data-act="close">Chiudi</button>`;
}

function evSheet(id) {
  const e = ev(id); if (!e) return '';
  const ds = D.del.filter(d => d.event_id === id); const f = fin(id); const ops = opsOf(id);
  const free = D.people.filter(p => p.active && !ops.some(a => a.profile_id === p.id));
  const d = parseD(e.date);
  return `<div class="grab"></div>
  <div><div class="eyebrow">${fmtLong(e.date)}</div><h2 class="h1" style="font-size:26px">${esc(e.name)}</h2><div class="t2" style="font-size:14px;padding-top:4px">${esc(e.venue || '–')} · ${timeTxt(e)}</div></div>
  ${refs(e)}
  <div class="grid2"><div><div class="k">Compenso cliente</div><div class="v">${eur(f?.fee)}</div></div><div><div class="k">Servizio</div><div class="v">${esc(serviceTxt(e))}</div></div></div>
  <div class="block" style="gap:10px"><div class="k">Operatori</div>
    <div class="chips">${ops.map(a => { const p = person(a.profile_id); return `<span class="opchip">${esc(p?.name)}${a.operator_fee != null && !p?.is_owner ? ' · ' + eur(a.operator_fee) : ''}<button aria-label="Togli ${esc(p?.name)}" data-act="unassign" data-id="${a.id}">×</button></span>`; }).join('') || '<span class="pill warn">Libero</span>'}</div>
    <div class="inline"><label class="f" for="as-p">Aggiungi<select id="as-p">${free.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><button class="btn ghost" data-act="assign" data-id="${id}">Aggiungi</button></div>
    ${ops.filter(a => !person(a.profile_id)?.is_owner).map(a => `<div class="toggle" style="padding:6px 0"><span class="t1" style="font-weight:500">${esc(person(a.profile_id)?.name)} pagato</span><button class="sw${a.operator_paid ? ' on' : ''}" role="switch" aria-checked="${a.operator_paid}" data-act="oppaid" data-id="${a.id}" aria-label="Operatore pagato"></button></div>`).join('')}
  </div>
  <div class="block" style="gap:0">
    <div class="toggle"><span class="t1" style="font-weight:500">Edit lo faccio io</span><button class="sw${e.edit_by_riky ? ' on' : ''}" role="switch" aria-checked="${e.edit_by_riky}" data-act="editriky" data-id="${id}" aria-label="Edit lo faccio io"></button></div>
    <div class="toggle"><span class="t1" style="font-weight:500">Il cliente ha pagato</span><button class="sw${f?.client_paid ? ' on' : ''}" role="switch" aria-checked="${!!f?.client_paid}" data-act="clientpaid" data-id="${id}" aria-label="Il cliente ha pagato"></button></div>
  </div>
  <div class="block"><div class="k">Consegne</div>${ds.length ? sortDel(ds).map(x => `<button class="rowbtn" data-act="deliv" data-id="${x.id}" style="padding:8px 0"><span class="grow"><span class="t1" style="font-weight:500">${TYPE_LABEL[x.type]} · ${esc(person(x.assignee_id)?.name || 'nessuno')}</span><span class="t2" style="color:${dayColor(x)}">${dStatus(x) === 'done' ? 'consegnato' : x.due_date ? 'entro ' + fmtShort(x.due_date) : ''}</span></span>${ic.chev}</button>`).join('') : '<div class="t2">Nessuna consegna</div>'}
    <div class="chips" style="padding-top:8px">${['foto', 'clip', 'reel'].map(t => `<button class="chip add" data-act="adddel" data-id="${id}" data-k="${t}">+ ${TYPE_LABEL[t]}</button>`).join('')}</div></div>
  <form id="evform" data-id="${id}" class="stack" style="gap:10px">
    <label class="f" for="ef-a">Link album precedente (Pixieset)<input id="ef-a" type="url" value="${esc(e.pixieset_prev_url || '')}" placeholder="https://…pixieset.com/…"></label>
    <label class="f" for="ef-i">Instagram della serata<input id="ef-i" type="url" value="${esc(e.instagram_url || '')}" placeholder="https://instagram.com/…"></label>
    <label class="f" for="ef-t">Scatti consigliati / cosa vogliono<textarea id="ef-t">${esc(e.shots_tips || '')}</textarea></label>
    <label class="f" for="ef-n">Note<textarea id="ef-n">${esc(e.notes || '')}</textarea></label>
    <button class="btn ghost" type="submit">Salva</button>
  </form>
  <div class="grid2">
    ${e.status === 'saltata' ? `<button class="btn ghost" data-act="evstatus" data-id="${id}" data-k="confermata">Riattiva serata</button>` : `<button class="btn ghost" style="color:var(--bad)" data-act="evstatus" data-id="${id}" data-k="saltata">Serata saltata</button>`}
    <button class="btn ghost" data-act="topost" data-id="${id}">Metti in bacheca</button>
  </div>
  <button class="btn ghost" data-act="close">Chiudi</button>`;
}

function newSheet() {
  const opts = D.formats.map(f => `<option value="${f.id}">${esc(f.name)}${f.venue ? ' · ' + esc(f.venue) : ''}</option>`).join('');
  return `<div class="grab"></div><h2 class="h2">Nuova serata</h2>
  <form id="newform" class="stack" style="gap:12px">
  <label class="f" for="nf-f">Serata<select id="nf-f"><option value="">Nuova (scrivi il nome)</option>${opts}</select></label>
  <label class="f" for="nf-n" id="nf-nl">Nome<input id="nf-n" placeholder="Nome serata"></label>
  <div class="grid2"><label class="f" for="nf-d">Data<input id="nf-d" type="date" required value="${nightToday()}"></label><label class="f" for="nf-v">Locale<input id="nf-v"></label></div>
  <div class="grid2"><label class="f" for="nf-s">Inizio<input id="nf-s" type="time"></label><label class="f" for="nf-e">Fine<input id="nf-e" type="time"></label></div>
  <div class="grid2"><label class="f" for="nf-p">Foto<input id="nf-p" placeholder="100"></label><label class="f" for="nf-st">Storie<input id="nf-st" placeholder="6"></label></div>
  <div class="grid2"><label class="f" for="nf-vid">Video<select id="nf-vid"><option value="">Nessuno</option><option value="clip">Clip</option><option value="reel">Reel</option></select></label><label class="f" for="nf-fee">Compenso cliente €<input id="nf-fee" type="number" inputmode="decimal" min="0" step="1"></label></div>
  <label class="f" for="nf-a">Assegna a<select id="nf-a"><option value="">Nessuno (resta libera)</option>${D.people.filter(p => p.active).map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
  <label class="check"><input type="checkbox" id="nf-r"> L’edit lo faccio io (trattengo la quota edit)</label>
  <div class="note">Le consegne si creano da sole: foto entro 3 giorni, clip la sera stessa, reel entro 5 giorni.</div>
  <div class="grid2"><button type="button" class="btn ghost" data-act="close">Annulla</button><button type="submit" class="btn">Crea</button></div></form>`;
}
function newPostSheet(evId) {
  const e = evId ? ev(evId) : null;
  return `<div class="grab"></div><h2 class="h2">Nuova richiesta in bacheca</h2>
  <form id="postform" class="stack" style="gap:12px" data-ev="${evId || ''}">
  <label class="f" for="np-t">Titolo<input id="np-t" required value="${esc(e ? e.name + (e.venue ? ' · ' + e.venue : '') : '')}"></label>
  <label class="f" for="np-d">Descrizione<textarea id="np-d" placeholder="Cosa serve, orari, attrezzatura…">${esc(e ? serviceTxt(e) + ' · ' + timeTxt(e) : '')}</textarea></label>
  <div class="grid2"><label class="f" for="np-g">Data<input id="np-g" type="date" value="${e ? e.date : ''}"></label><label class="f" for="np-f">Cachet €<input id="np-f" type="number" inputmode="decimal" min="0"></label></div>
  <div class="grid2"><button type="button" class="btn ghost" data-act="close">Annulla</button><button type="submit" class="btn">Pubblica</button></div></form>`;
}
function newPersonSheet() {
  return `<div class="grab"></div><h2 class="h2">Nuovo operatore</h2>
  <form id="npform" class="stack" style="gap:12px">
  <label class="f" for="nn-n">Nome<input id="nn-n" required></label>
  <label class="f" for="nn-e">Email (per l’accesso)<input id="nn-e" type="email"></label>
  <label class="f" for="nn-t">Telefono WhatsApp<input id="nn-t" type="tel"></label>
  <div class="grid2"><button type="button" class="btn ghost" data-act="close">Annulla</button><button type="submit" class="btn">Aggiungi</button></div></form>`;
}

// ---------- chat con Claude ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null;
function chatSheet() {
  const msgs = S.chat.map(m => `<div class="msg ${m.role === 'user' ? 'me' : 'ai'}">${esc(m.content)}</div>`).join('');
  return `<div class="grab"></div>
  <div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h2">Chat con Claude</h2><button class="filterchip" data-act="close">Chiudi</button></div>
  <div class="chatlist" id="ch-list">${msgs || '<div class="note">Scrivi o detta cosa cambiare: “la serata di Viral sabato salta”, “aggiungi un TikTok prima di Freedom”, “Elody ha consegnato le foto di Fuorisede”. Le richieste di modifiche all’app le salvo per la prossima sessione.</div>'}${S.chatBusy ? '<div class="msg ai typing">Sto lavorando…</div>' : ''}</div>
  <form id="chatform" class="chatbar">
    ${SR ? `<button type="button" class="iconbtn${S.listening ? ' rec' : ''}" data-act="mic" aria-label="${S.listening ? 'Ferma dettatura' : 'Detta'}">${ic.mic}</button>` : ''}
    <textarea id="ch-t" rows="1" placeholder="${S.listening ? 'Ti ascolto…' : 'Scrivi a Claude'}" aria-label="Messaggio"></textarea>
    <button type="submit" class="iconbtn send" aria-label="Invia" ${S.chatBusy ? 'disabled' : ''}>${ic.send}</button>
  </form>`;
}
async function openChat() {
  S.sheet = ['chat']; render();
  const { data } = await sb.from('chat_messages').select('role,content').eq('profile_id', D.me.id).order('created_at', { ascending: false }).limit(40);
  S.chat = (data || []).reverse(); render();
}
async function sendChat() {
  const t = document.getElementById('ch-t'); const msg = t?.value.trim(); if (!msg || S.chatBusy) return;
  if (recog) { try { recog.stop(); } catch (e) {} }
  t.value = ''; S.chat.push({ role: 'user', content: msg }); S.chatBusy = true; render();
  const { data, error } = await sb.functions.invoke('assistente', { body: { message: msg } });
  S.chatBusy = false;
  S.chat.push({ role: 'assistant', content: error ? 'Errore: ' + (error.message || error) : (data?.reply || data?.error || '…') });
  await load().catch(() => {}); render();
}
function toggleMic() {
  if (!SR) return;
  if (S.listening && recog) { recog.stop(); return; }
  recog = new SR(); recog.lang = 'it-IT'; recog.interimResults = true; recog.continuous = false;
  const base = document.getElementById('ch-t')?.value || '';
  recog.onresult = ev => { const txt = Array.from(ev.results).map(r => r[0].transcript).join(''); const t = document.getElementById('ch-t'); if (t) t.value = (base ? base + ' ' : '') + txt; };
  recog.onend = () => { S.listening = false; recog = null; render(); };
  recog.onerror = () => { S.listening = false; };
  S.listening = true; render(); recog.start();
}

// ---------- render ----------
function render() {
  const app = document.getElementById('app'); const navw = document.getElementById('navwrap'); const L = document.getElementById('layer');
  if (!session) { app.innerHTML = loginView(); navw.hidden = true; L.innerHTML = S.toast ? `<div class="toast" role="status">${esc(S.toast)}</div>` : ''; return; }
  if (!D) { app.innerHTML = '<div class="empty" style="padding-top:40vh">Carico…</div>'; navw.hidden = true; return; }
  if (!D.me) {
    app.innerHTML = `<div class="login"><div class="brandlogo" role="img" aria-label="Studio Zero"><i class="lw"></i><i class="lr"></i></div><h1 class="h1">Quasi fatto</h1><div class="note">L’email ${esc(session.user.email)} non è ancora nel team. Chiedi a Riky di aggiungerla nella tua scheda, poi tocca Riprova.</div><button class="btn" data-act="refresh">Riprova</button><button class="btn ghost" data-act="logout">Esci</button></div>`;
    navw.hidden = true; L.innerHTML = ''; return;
  }
  const admin = isAdmin();
  let body = '';
  if (admin) body = S.tab === 'home' ? adminHome() : S.tab === 'events' ? adminEvents() : S.tab === 'team' ? adminTeam() : adminMe();
  else body = S.tab === 'home' ? collabHome() : S.tab === 'jobs' ? (S.job ? '' : '<div class="pad"><h2 class="h2" style="padding-top:4px">I miei lavori</h2></div>') + myJobs(D.me.id) : S.tab === 'board' ? collabBoard() : S.tab === 'money' ? collabMoney() : collabProfile();
  app.innerHTML = `<div class="top"><div class="brandlogo" role="img" aria-label="Studio Zero"><i class="lw"></i><i class="lr"></i></div><div class="topright">${admin ? `<button class="iconbtn" data-act="chat" aria-label="Chat con Claude">${ic.chat}</button>` : ''}<button class="iconbtn" data-act="refresh" aria-label="Aggiorna">${ic.refresh}</button></div></div>${body}`;
  navw.hidden = false;
  const n = document.getElementById('nav');
  const b = (tab, label, icon) => `<button class="${S.tab === tab ? 'on' : ''}" aria-label="${label}" data-act="tab" data-id="${tab}" ${S.tab === tab ? 'aria-current="page"' : ''}>${icon}</button>`;
  n.innerHTML = admin
    ? b('home', 'Home', ic.home) + b('events', 'Eventi', ic.cal) + `<button class="plus" aria-label="Nuova serata" data-act="new">${ic.plus}</button>` + b('team', 'Team', ic.team) + b('me', 'I miei lavori e accessi', avatar(D.me))
    : b('home', 'Home', ic.home) + b('jobs', 'I miei lavori', ic.cam) + b('board', 'Bacheca', ic.board) + b('money', 'Soldi', ic.money) + b('profile', 'Profilo', avatar(D.me));
  let sh = '';
  if (S.sheet) {
    const [k, id] = S.sheet;
    sh = k === 'chat' ? chatSheet() : k === 'deliv' ? delivSheet(id) : k === 'ev' ? evSheet(id) : k === 'person' ? personSheet(id) : k === 'post' ? newPostSheet(id) : k === 'newperson' ? newPersonSheet() : newSheet();
    const keep = L.querySelector('.sheet')?.scrollTop || 0;
    const typed = document.getElementById('ch-t')?.value;
    L.innerHTML = `<div class="sheet-bg" data-act="bg"><div class="sheet${k === 'chat' ? ' chatsheet' : ''}" role="dialog" aria-modal="true">${sh}</div></div>`;
    L.querySelector('.sheet').scrollTop = keep;
    if (k === 'chat') { const t = document.getElementById('ch-t'); if (typed != null && t) t.value = typed; const l = document.getElementById('ch-list'); if (l) l.scrollTop = l.scrollHeight; }
  } else L.innerHTML = '';
  if (S.toast) L.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${esc(S.toast)}</div>`);
}
let tt;
function toast(m) { S.toast = m; render(); clearTimeout(tt); tt = setTimeout(() => { S.toast = null; render(); }, 2800); }

// ---------- azioni ----------
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act, id = t.dataset.id, k = t.dataset.k;
  if (a === 'bg') { if (e.target === t) { S.sheet = null; render(); } return; }
  if (t.tagName === 'A') return;
  switch (a) {
    case 'mode': S.mode = id; S.err = null; break;
    case 'tab': S.tab = id; S.job = null; window.scrollTo(0, 0); break;
    case 'filter': S.filter = (S.filter === id && id !== 'all') ? 'all' : id; break;
    case 'free': S.tab = 'events'; S.evSeg = 'free'; break;
    case 'evseg': S.evSeg = id; break;
    case 'meseg': S.meSeg = id; S.job = null; break;
    case 'deliv': S.sheet = ['deliv', id]; break;
    case 'ev': S.sheet = ['ev', id]; break;
    case 'person': S.sheet = ['person', id]; break;
    case 'new': S.sheet = ['new']; break;
    case 'newpost': S.sheet = ['post', null]; break;
    case 'topost': S.sheet = ['post', id]; break;
    case 'newperson': S.sheet = ['newperson']; break;
    case 'close': S.sheet = null; break;
    case 'job': S.job = id; window.scrollTo(0, 0); break;
    case 'cjob': S.tab = isAdmin() ? 'me' : 'jobs'; S.meSeg = 'jobs'; S.job = id; window.scrollTo(0, 0); break;
    case 'closejob': S.job = null; break;
    case 'refresh': return refresh('Dati aggiornati');
    case 'chat': return openChat();
    case 'mic': return toggleMic();
    case 'logout': await sb.auth.signOut(); return;
    case 'deliver': {
      const inp = document.getElementById(t.dataset.src || 'wt-' + id); const link = inp ? inp.value.trim() : undefined;
      const patch = { delivered_at: new Date().toISOString() }; if (link !== undefined) patch.link = link || null;
      if (inp && !link && !confirmNoLink()) return;
      S.sheet = S.sheet && S.sheet[0] === 'deliv' ? null : S.sheet;
      return run(sb.from('deliverables').update(patch).eq('id', id), 'Consegna segnata ✓');
    }
    case 'undeliver': return run(sb.from('deliverables').update({ delivered_at: null }).eq('id', id), 'Consegna riaperta');
    case 'savedel': return run(sb.from('deliverables').update({ link: document.getElementById('dl-l').value.trim() || null, assignee_id: document.getElementById('dl-a').value || null, due_date: document.getElementById('dl-d').value || null }).eq('id', id), 'Salvato');
    case 'admin': { const p = person(id); return run(sb.from('profiles').update({ role: p.role === 'admin' ? 'operatore' : 'admin' }).eq('id', id), p.role === 'admin' ? p.name + ' non è più admin' : p.name + ' ora è admin'); }
    case 'perm': { const p = person(id); const perms = { ...(p.perms || {}) }; perms[k] = !perms[k]; return run(sb.from('profiles').update({ perms }).eq('id', id)); }
    case 'assign': { const pid = document.getElementById('as-p')?.value; if (!pid) return; return run(sb.from('assignments').insert({ event_id: id, profile_id: pid }), 'Assegnato'); }
    case 'unassign': return run(sb.from('assignments').delete().eq('id', id), 'Tolto');
    case 'oppaid': { const x = D.asg.find(y => y.id === id); return run(sb.from('assignments').update({ operator_paid: !x.operator_paid, operator_paid_at: x.operator_paid ? null : TODAY() }).eq('id', id)); }
    case 'editriky': { const x = ev(id); return run(sb.from('events').update({ edit_by_riky: !x.edit_by_riky }).eq('id', id), x.edit_by_riky ? 'Edit all’operatore' : 'Edit tuo: ricorda di aggiornare la quota se serve'); }
    case 'clientpaid': { const f = fin(id); if (f) return run(sb.from('event_finance').update({ client_paid: !f.client_paid, client_paid_at: f.client_paid ? null : TODAY() }).eq('event_id', id)); return run(sb.from('event_finance').insert({ event_id: id, client_paid: true, client_paid_at: TODAY() })); }
    case 'evstatus': S.sheet = null; return run(sb.from('events').update({ status: k }).eq('id', id), k === 'saltata' ? 'Serata segnata come saltata' : 'Serata riattivata');
    case 'adddel': { const x = ev(id); const due = new Date(parseD(x.date)); due.setDate(due.getDate() + (k === 'foto' ? 3 : k === 'reel' ? 5 : 0)); const op = opsOf(id)[0]?.profile_id || null; return run(sb.from('deliverables').insert({ event_id: id, type: k, due_date: isoLocal(due), assignee_id: op }), TYPE_LABEL[k] + ' aggiunta'); }
    case 'pick': { const post = D.posts.find(p => p.id === id); const r = await sb.from('board_posts').update({ status: 'assegnata', chosen_id: k }).eq('id', id); if (r.error) return toast('Errore: ' + r.error.message);
      if (post.event_id && !opsOf(post.event_id).some(x => x.profile_id === k)) { await sb.from('assignments').insert({ event_id: post.event_id, profile_id: k, operator_fee: post.operator_fee }); await sb.from('deliverables').update({ assignee_id: k }).eq('event_id', post.event_id).is('assignee_id', null); }
      return refresh('Assegnato a ' + person(k)?.name); }
    case 'closepost': return run(sb.from('board_posts').update({ status: 'chiusa' }).eq('id', id), 'Richiesta chiusa');
    case 'offer': return run(sb.from('board_offers').insert({ post_id: id, profile_id: D.me.id }), 'Ti sei proposto');
    case 'unoffer': return run(sb.from('board_offers').delete().eq('post_id', id).eq('profile_id', D.me.id), 'Proposta ritirata');
    case 'sel': { const arr = (D.me[k] || []).slice(); const i = arr.indexOf(id); i >= 0 ? arr.splice(i, 1) : arr.push(id); D.me[k] = arr; render(); const { error } = await sb.from('profiles').update({ [k]: arr }).eq('id', D.me.id); if (error) toast('Errore: ' + error.message); return; }
    case 'addsel': { const v = (prompt('Cosa vuoi aggiungere?') || '').trim(); if (!v) return; const arr = (D.me[k] || []).concat(v); return run(sb.from('profiles').update({ [k]: arr }).eq('id', D.me.id), 'Aggiunto'); }
  }
  render();
});
function confirmNoLink() { return confirm('Non hai incollato nessun link. Segno comunque come consegnato?'); }

document.addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target; const v = id => document.getElementById(id)?.value.trim();
  if (f.id === 'loginform') return submitLogin();
  if (f.id === 'chatform') return sendChat();
  if (f.id === 'personform') return run(sb.from('profiles').update(Object.assign({ phone: v('pf-t') || null }, person(f.dataset.id).is_owner ? {} : { email: v('pf-e') || null })).eq('id', f.dataset.id), 'Salvato');
  if (f.id === 'phoneform') return run(sb.from('profiles').update({ phone: v('me-t') || null }).eq('id', D.me.id), 'Telefono salvato');
  if (f.id === 'evform') return run(sb.from('events').update({ pixieset_prev_url: v('ef-a') || null, instagram_url: v('ef-i') || null, shots_tips: v('ef-t') || null, notes: v('ef-n') || null }).eq('id', f.dataset.id), 'Salvato');
  if (f.id === 'npform') { S.sheet = null; const name = v('nn-n'); return run(sb.from('profiles').insert({ name, initials: name[0].toUpperCase(), email: v('nn-e') || null, phone: v('nn-t') || null }), name + ' aggiunto al team'); }
  if (f.id === 'postform') { S.sheet = null; return run(sb.from('board_posts').insert({ title: v('np-t'), description: v('np-d') || null, date: v('np-g') || null, operator_fee: v('np-f') ? Number(v('np-f')) : null, event_id: f.dataset.ev || null }), 'Richiesta pubblicata'); }
  if (f.id === 'newform') {
    const fmt = D.formats.find(x => x.id === v('nf-f'));
    const name = v('nf-n') || fmt?.name; if (!name) return toast('Scrivi il nome della serata');
    const date = v('nf-d'); const video = v('nf-vid') || null; const photos = v('nf-p') || null;
    const row = { format_id: fmt?.id || null, client_id: fmt?.client_id || null, name, venue: v('nf-v') || null, date, start_time: v('nf-s') || null, end_time: v('nf-e') || null, photos, stories: v('nf-st') || null, video, edit_by_riky: document.getElementById('nf-r').checked };
    const r = await sb.from('events').insert(row).select().single(); if (r.error) return toast('Errore: ' + r.error.message);
    const eid = r.data.id; const fee = v('nf-fee');
    await sb.from('event_finance').insert({ event_id: eid, fee: fee ? Number(fee) : null });
    const op = v('nf-a') || null;
    if (op) await sb.from('assignments').insert({ event_id: eid, profile_id: op });
    const dues = []; const add = (type, days) => { const d = parseD(date); d.setDate(d.getDate() + days); dues.push({ event_id: eid, type, due_date: isoLocal(d), assignee_id: op }); };
    if (photos) add('foto', 3); if (video === 'clip') add('clip', 0); if (video === 'reel') add('reel', 5);
    if (dues.length) await sb.from('deliverables').insert(dues);
    S.sheet = null; return refresh('Serata creata');
  }
});
document.addEventListener('keydown', e => { if (e.target.id === 'ch-t' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
document.addEventListener('change', e => {
  if (e.target.id !== 'nf-f') return;
  const fmt = D.formats.find(x => x.id === e.target.value); if (!fmt) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
  set('nf-n', fmt.name); set('nf-v', fmt.venue); set('nf-s', hm(fmt.start_time)); set('nf-e', hm(fmt.end_time)); set('nf-p', fmt.photos); set('nf-st', fmt.stories); set('nf-vid', fmt.video); set('nf-fee', fmt.fee);
  if (fmt.weekday) { const d = new Date(); const want = fmt.weekday % 7; while (d.getDay() !== want) d.setDate(d.getDate() + 1); set('nf-d', isoLocal(d)); }
});

// ---------- avvio ----------
async function boot() {
  const { data } = await sb.auth.getSession(); session = data.session;
  if (!session) { D = null; render(); return; }
  render();
  try { await sb.rpc('claim_profile'); await load(); } catch (err) { D = { me: null, people: [], events: [] }; toast('Errore nel caricare i dati: ' + (err.message || err)); }
  render();
}
sb.auth.onAuthStateChange((evt, s) => {
  if (evt === 'PASSWORD_RECOVERY') { session = null; S.mode = 'newpass'; render(); return; }
  if (evt === 'SIGNED_IN' && (!session || session.user.id !== s.user.id)) { session = s; boot(); }
  if (evt === 'SIGNED_OUT') { session = null; D = null; S.tab = 'home'; S.sheet = null; render(); }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && session && D?.me && !S.sheet) refresh(); });
boot();
