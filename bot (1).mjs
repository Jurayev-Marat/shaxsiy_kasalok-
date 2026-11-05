// Cloudflare Worker — Shaxsiy Reja boti
// Bog'lanishlar (Settings → Bindings): KV (KV namespace), AI (Workers AI — ovozli xabar uchun)
// O'zgaruvchilar: BOT_TOKEN, APP_URL (https://username.github.io/reja/ — oxirida /)
// Cron (Settings → Triggers) — 2 ta: `0 4 * * 1` (haftalik hisobot, dushanba 09:00 Toshkent) va `*/5 * * * *` (vazifa eslatmalari)

const T = {
  uz: { wel: n => `Xush kelibsiz, <b>${n}</b>! 👋\n<b>Shaxsiy Reja</b> — kartalar, kasholak, qarzlar va eslatmalar bir joyda.`,
    hi: n => `<b>Men qanday ishlayman?</b>\nIlovaga kirmasdan, menga yozing yoki 🎤 ovozli xabar yuboring:\n\n💸 <b>Chiqim</b>\n• «chiqim oziq-ovqat uchun 150000»\n• «1038 kartamdan 300000 yo'lga ishlatdim»\n\n💰 <b>Kirim</b>\n• «kirim oylik uchun 4500000»\n• «oylik tushdi 4 500 000»\n\n⏰ <b>Eslatma</b>\n• «ertaga soat 14:00 da majlis bor» — shu vaqtda yozaman\n\n📊 Har dushanba haftalik hisobot yuboraman, xohlagan vaqtda — /hisobot\n🔄 Yozganlaringiz ilovani ochganingizda avtomatik qo'shiladi.\n\n🚀 Ilovani ochamizmi?`, flip: '🔄 Kirim ⇄ Chiqim', late: "Yozuv ilovaga o'tib bo'lgan, ilovada o'chirib qayta yozing", open: '🚀 Ilovani ochish',
    ok: (a, t, c, l) => `✅ Yozildi: ${t === 'in' ? 'kirim' : 'chiqim'} ${a} so'm · ${c}${l ? ' · karta ••' + l : ''}\nIlovani ochganingizda qo'shiladi.`,
    rem: (w, n) => `⏰ Eslatma qo'yildi: <b>${w}</b>\n👉 ${n}\n\nVaqti kelganda shu yerga yozaman.`,
    bad: `Summani tushunmadim 🤔 Masalan: «1038 kartamdan 300000 yo'lga ishlatdim»`, nov: `Ovozni tanib bo'lmadi 😕 Iltimos, matn qilib yozing.`, nosnap: `Hisobot uchun avval ilovani bir marta oching.` },
  ru: { wel: n => `Добро пожаловать, <b>${n}</b>! 👋\n<b>Личный план</b> — карты, кошелёк, долги и напоминания в одном месте.`,
    hi: n => `<b>Как я работаю?</b>\nНе заходя в приложение, пишите мне или отправляйте 🎤 голос:\n\n💸 <b>Расход</b>\n• «расход на продукты 150000»\n• «с карты 1038 потратил 300000 на дорогу»\n\n💰 <b>Доход</b>\n• «доход зарплата 4500000»\n• «пришла зарплата 4 500 000»\n\n⏰ <b>Напоминание</b>\n• «завтра в 14:00 совещание» — напишу в это время\n\n📊 Каждый понедельник присылаю недельный отчёт, в любой момент — /report\n🔄 Записи добавятся в приложение, когда вы его откроете.\n\n🚀 Открыть приложение?`, flip: '🔄 Доход ⇄ Расход', late: "Запись уже в приложении — удалите и добавьте заново", open: '🚀 Открыть приложение',
    ok: (a, t, c, l) => `✅ Записано: ${t === 'in' ? 'доход' : 'расход'} ${a} сум · ${c}${l ? ' · карта ••' + l : ''}\nДобавится при открытии приложения.`,
    rem: (w, n) => `⏰ Напоминание создано: <b>${w}</b>\n👉 ${n}\n\nВ нужное время напишу сюда.`,
    bad: `Не понял сумму 🤔 Например: «с карты 1038 потратил 300000 на дорогу»`, nov: `Не удалось распознать голос 😕 Напишите текстом.`, nosnap: `Для отчёта сначала один раз откройте приложение.` },
  en: { wel: n => `Welcome, <b>${n}</b>! 👋\n<b>Personal Planner</b> — cards, wallet, debts and reminders in one place.`,
    hi: n => `<b>How do I work?</b>\nWithout opening the app, just write to me or send a 🎤 voice note:\n\n💸 <b>Expense</b>\n• "expense food 150000"\n• "spent 300000 on transport from card 1038"\n\n💰 <b>Income</b>\n• "income salary 4500000"\n• "salary received 4 500 000"\n\n⏰ <b>Reminder</b>\n• "meeting tomorrow at 14:00" — I'll message you then\n\n📊 I send a weekly report every Monday, any time — /report\n🔄 Your entries are added to the app next time you open it.\n\n🚀 Open the app?`, flip: '🔄 Income ⇄ Expense', late: "Already moved to the app — delete and re-add it there", open: '🚀 Open the app',
    ok: (a, t, c, l) => `✅ Saved: ${t === 'in' ? 'income' : 'expense'} ${a} UZS · ${c}${l ? ' · card ••' + l : ''}\nIt will be added when you open the app.`,
    rem: (w, n) => `⏰ Reminder set: <b>${w}</b>\n👉 ${n}\n\nI'll message you here when it's time.`,
    bad: `I couldn't find the amount 🤔 Example: "spent 300000 on transport from card 1038"`, nov: `Couldn't recognize the voice note 😕 Please type it.`, nosnap: `Open the app once first to get a report.` },
};
const CN = {
  ru: { 'Oziq-ovqat': 'Продукты', Transport: 'Транспорт', Kommunal: 'Коммуналка', "Ko'ngilochar": 'Развлечения', Salomatlik: 'Здоровье', Kiyim: 'Одежда', Boshqa: 'Другое', Oylik: 'Зарплата', Avans: 'Аванс', Mukofot: 'Премия', "Qo'shimcha daromad": 'Доп. доход' },
  en: { 'Oziq-ovqat': 'Food', Transport: 'Transport', Kommunal: 'Utilities', "Ko'ngilochar": 'Fun', Salomatlik: 'Health', Kiyim: 'Clothes', Boshqa: 'Other', Oylik: 'Salary', Avans: 'Advance', Mukofot: 'Bonus', "Qo'shimcha daromad": 'Extra income' },
};
const cn = (c, lg) => (CN[lg] && CN[lg][c]) || c;
const RT = {
  uz: ['📊 Haftalik hisobot', 'Kirim', 'Chiqim', 'Umumiy qoldiq', "Eng ko'p harajat", 'Qarz muddatlari', 'menga qaytaradi', 'men qaytaraman', "so'm", "Bu hafta yozuv yo'q"],
  ru: ['📊 Недельный отчёт', 'Доход', 'Расход', 'Общий остаток', 'Больше всего расходов', 'Сроки долгов', 'вернут мне', 'я верну', 'сум', 'За неделю записей нет'],
  en: ['📊 Weekly report', 'Income', 'Expenses', 'Total balance', 'Top expenses', 'Debt deadlines', 'owes me', 'I owe', 'UZS', 'No entries this week'],
};
const pick = c => (/^ru/.test(c || '') ? 'ru' : /^en/.test(c || '') ? 'en' : 'uz');
const f = n => Number(n).toLocaleString('ru-RU');

// "1038 kartamdan 300000 puni yo'lga ishlatdim" -> {a, t, c, l4, n}
function parse(text) {
  let s = text.toLowerCase().replace(/[’`ʻʼ‘]/g, "'");
  let l4 = null;
  const m = s.match(/(\d{4})\s*-?\s*(?:raqamli\s+)?(?:karta|kartam|card|карт)/) || s.match(/(?:karta|kartam|card|карт[а-яё]*)\s*(?:raqam\w*\s*)?(\d{4})(?!\d)/);
  if (m) { l4 = m[1]; s = s.replace(m[0], ' '); }
  let a = 0;
  for (const x of s.matchAll(/(\d[\d ]*\d(?:[.,]\d+)?|\d(?:[.,]\d+)?)\s*(ming|тыс[а-яё]*|k\b|к\b|mln|mlyon|million|млн|миллион[а-яё]*)?/g)) {
    const u = x[2] || '';
    let v = u ? parseFloat(x[1].replace(/ /g, '').replace(',', '.')) : Number(x[1].replace(/[ ,.]/g, ''));
    if (/^(ming|тыс|k|к)/.test(u)) v *= 1000; else if (u) v *= 1e6;
    if (v > a) a = v;
  }
  if (!a) return null;
  const out = /chiqim|harajat|xarajat|расход|expense/.test(s);
  const inc = !out && /oylik|maosh|avans|tushdi|keldi|pul oldim|kirim|daromad|mukofot|bonus|получил|зарплат|пришл|доход|income|salary|received|earned/.test(s);
  const incR = [[/oylik|maosh|зарплат|salary/, 'Oylik'], [/avans|аванс/, 'Avans'], [/mukofot|bonus|премi|прем/, 'Mukofot']];
  const expR = [[/yo'l|yol|yul|taksi|benzin|avtobus|metro|transport|такси|бензин|дорог|taxi|fuel|bus/, 'Transport'], [/ovqat|\bnon|bozor|oziq|restoran|kafe|market|еда|продукт|food|grocer|cafe/, 'Oziq-ovqat'], [/kommunal|svet|elektr|\bgaz|\bsuv|internet|свет|коммунал|utilit|electric/, 'Kommunal'], [/dori|shifokor|apteka|klinika|лекарств|аптек|doctor|pharm/, 'Salomatlik'], [/kiyim|poyabzal|одежд|clothes/, 'Kiyim'], [/kino|o'yin|konsert|кино|game|movie/, "Ko'ngilochar"]];
  const rules = inc ? incR.concat(expR) : expR;
  let c = inc ? "Qo'shimcha daromad" : 'Boshqa';
  for (const [r, n] of rules) if (r.test(s)) { c = n; break; }
  return { a, t: inc ? 'in' : 'out', c, l4, n: text.trim().slice(0, 80) };
}

// «ertaga soat 14:00 ga majlis bor» -> {n, d(ISO), w}. Pul gaplari bo'lsa null qaytaradi.
function parseRem(text) {
  const s = text.toLowerCase().replace(/[’`ʻʼ‘]/g, "'");
  const cue = /ertaga|indinga|bugun|завтра|послезавтра|сегодня|tomorrow|today|soat\s*\d|\d{1,2}\s*[:.]\s*\d{2}|\bв\s*\d|\bat\s*\d/.test(s);
  const money = /karta|kartam|card|карт|so'm|сум|uzs|ming|mln|million|млн|тыс|ishlatdim|sarfladim|to'ladim|oldim|berdim|потрат|заплат|spent|paid|bought|\d{5,}/.test(s);
  if (!cue || money) return null;
  const TZ = 5 * 36e5, loc = new Date(Date.now() + TZ);
  let dd = /indinga|послезавтра|day after/.test(s) ? 2 : /ertaga|завтра|tomorrow/.test(s) ? 1 : 0, H = 9, M = 0;
  const t = s.match(/(\d{1,2})\s*[:.]\s*(\d{2})/) || s.match(/(?:soat|в|at)\s*(\d{1,2})/);
  if (t) { H = +t[1]; M = +(t[2] || 0); }
  if (H > 23 || M > 59) return null;
  let d = new Date(Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate() + dd, H, M) - TZ);
  if (d.getTime() < Date.now() - 6e4) d = new Date(d.getTime() + 864e5);
  let n = text.replace(/ertaga|indinga|bugun|завтра|послезавтра|сегодня|tomorrow|today/gi, '')
    .replace(/(?:soat|в|at)\s*\d{1,2}(?:\s*[:.]\s*\d{2})?(?:\s*-?(?:ga|da))?|\d{1,2}\s*[:.]\s*\d{2}(?:\s*-?(?:ga|da))?/gi, '')
    .replace(/\s+/g, ' ').trim() || text.trim();
  n = (n[0].toUpperCase() + n.slice(1)).slice(0, 100);
  const l = new Date(d.getTime() + TZ), p = x => String(x).padStart(2, '0');
  return { n, d: d.toISOString(), w: `${p(l.getUTCDate())}.${p(l.getUTCMonth() + 1)} ${p(l.getUTCHours())}:${p(l.getUTCMinutes())}` };
}

async function verify(init, token) {
  try {
    const p = new URLSearchParams(init), h = p.get('hash'); p.delete('hash');
    const str = [...p.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1)).map(([k, v]) => k + '=' + v).join('\n');
    const enc = new TextEncoder();
    const hm = async (k, d) => new Uint8Array(await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(d)));
    const sig = [...(await hm(await hm(enc.encode('WebAppData'), token), str))].map(b => b.toString(16).padStart(2, '0')).join('');
    return sig === h ? JSON.parse(p.get('user')).id : null;
  } catch { return null; }
}

function report(sn, inb) {
  const lg = sn.lg || 'uz', R = RT[lg], wk = Date.now() - 7 * 864e5;
  inb = (inb || []).filter(e => e.k !== 'task');
  const tx = (sn.tx || []).filter(x => new Date(x.d) >= wk).concat((inb || []).filter(e => e.ts >= wk));
  let i = 0, o = 0; const by = {};
  tx.forEach(x => { if (x.t === 'in') i += x.a; else { o += x.a; by[x.c] = (by[x.c] || 0) + x.a; } });
  const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c, v]) => `• ${cn(c, lg)}: ${f(v)} ${R[8]}`).join('\n');
  const bal = (sn.a || []).reduce((s, x) => s + x.v, 0) + (inb || []).reduce((s, e) => s + (e.t === 'in' ? e.a : -e.a), 0);
  const lim = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  const debts = (sn.db || []).filter(d => d.due && d.due <= lim).map(d => `• ${String(d.w).replace(/[<>&]/g, '')} — ${f(d.a)} ${R[8]} (${d.k === 'g' ? R[6] : R[7]}, ${d.due})`).join('\n');
  return `<b>${R[0]}</b>\n\n📥 ${R[1]}: <b>${f(i)} ${R[8]}</b>\n📤 ${R[2]}: <b>${f(o)} ${R[8]}</b>\n💰 ${R[3]}: <b>${f(bal)} ${R[8]}</b>` +
    (top ? `\n\n🔥 ${R[4]}:\n${top}` : `\n\n${R[9]}`) + (debts ? `\n\n🤝 ${R[5]}:\n${debts}` : '');
}

async function weekly(env, api) {
  if (!env.KV) return;
  const ks = await env.KV.list({ prefix: 'snap:' });
  for (const k of ks.keys) {
    const uid = k.name.slice(5), sn = JSON.parse((await env.KV.get(k.name)) || 'null');
    if (!sn) continue;
    const inb = JSON.parse((await env.KV.get('in:' + uid)) || '[]');
    await api('sendMessage', { chat_id: uid, parse_mode: 'HTML', text: report(sn, inb) });
  }
}

const RM = {
  uz: t => `⏰ <b>Eslatma</b>\n\nBugun bu ishni qilishingiz kerak:\n👉 <b>${t}</b>`,
  ru: t => `⏰ <b>Напоминание</b>\n\nСегодня нужно сделать:\n👉 <b>${t}</b>`,
  en: t => `⏰ <b>Reminder</b>\n\nYou need to do this today:\n👉 <b>${t}</b>`,
};
const OPEN = { uz: '📱 Ilovani ochish', ru: '📱 Открыть приложение', en: '📱 Open the app' };

// Vazifa vaqti kelganda (yoki o'tib ketgan, lekin 24 soatdan oshmagan) bir marta xabar yuboradi
async function remind(env, api) {
  if (!env.KV) return;
  const now = Date.now(), uids = new Set();
  for (const p of ['snap:', 'bt:']) for (const k of (await env.KV.list({ prefix: p })).keys) uids.add(k.name.slice(p.length));
  for (const uid of uids) {
    const sn = JSON.parse((await env.KV.get('snap:' + uid)) || 'null') || {};
    const bt = JSON.parse((await env.KV.get('bt:' + uid)) || '[]');
    const all = (sn.tk || []).concat(bt);
    const due = all.filter(t => { const d = new Date(t.d).getTime(); return d <= now && now - d < 864e5; });
    if (!due.length) continue;
    const key = 'tr:' + uid, sent = JSON.parse((await env.KV.get(key)) || '{}'), lg = sn.lg || (bt[0] && bt[0].lg) || 'uz';
    let ch = 0;
    for (const t of due) {
      if (sent[t.id] === t.d) continue;
      sent[t.id] = t.d; ch = 1;
      await api('sendMessage', { chat_id: uid, parse_mode: 'HTML', text: RM[lg](String(t.n).replace(/[<>&]/g, '')),
        reply_markup: { inline_keyboard: [[{ text: OPEN[lg], web_app: { url: `${env.APP_URL}?lang=${lg}` } }]] } });
    }
    if (ch) {
      const ids = new Set(all.map(t => String(t.id)));
      Object.keys(sent).forEach(i => { if (!ids.has(i)) delete sent[i]; });
      await env.KV.put(key, JSON.stringify(sent));
    }
    // o'tib ketgan bot-vazifalarni tozalash
    const keep = bt.filter(t => now - new Date(t.d).getTime() < 864e5);
    if (keep.length !== bt.length) await env.KV.put('bt:' + uid, JSON.stringify(keep));
  }
}

async function stt(env, api, fid, lg) {
  const fi = await (await api('getFile', { file_id: fid })).json();
  const u8 = new Uint8Array(await (await fetch(`https://api.telegram.org/file/bot${env.BOT_TOKEN}/${fi.result.file_path}`)).arrayBuffer());
  let bin = ''; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  const r = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio: btoa(bin), language: lg });
  return (r.text || '').trim();
}

export default {
  async scheduled(ev, env, ctx) {
    const api = (m, b) => fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    ctx.waitUntil(ev.cron === '0 4 * * 1' ? weekly(env, api) : remind(env, api));
  },

  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Bot ishlayapti ✅');
    const url = new URL(req.url);
    let u; try { u = await req.json(); } catch { return new Response('OK'); }

    // --- Mini ilova uchun API ---
    if (url.pathname === '/inbox' || url.pathname === '/sync') {
      const uid = await verify(u.initData || '', env.BOT_TOKEN);
      const J = o => new Response(JSON.stringify(o), { headers: { ...cors, 'Content-Type': 'application/json' } });
      if (!uid || !env.KV) return J({ error: 'auth' });
      if (url.pathname === '/inbox') {
        const e = JSON.parse((await env.KV.get('in:' + uid)) || '[]');
        if (e.length) { await env.KV.delete('in:' + uid); await env.KV.delete('bt:' + uid); }
        return J({ entries: e });
      }
      await env.KV.put('snap:' + uid, JSON.stringify(u.snap || {}));
      return J({ ok: 1 });
    }

    // --- Telegram webhook ---
    const api = (m, b) => fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    const kb = lg => ({ inline_keyboard: [
      [{ text: T[lg].open, web_app: { url: `${env.APP_URL}?lang=${lg}&api=${encodeURIComponent(url.origin)}` } }],
      [{ text: "🇺🇿 O'zbekcha", callback_data: 'l:uz' }, { text: '🇷🇺 Русский', callback_data: 'l:ru' }, { text: '🇬🇧 English', callback_data: 'l:en' }],
    ] });
    const clean = s => String(s || '').replace(/[<>&]/g, '');

    const q = u.callback_query;
    if (q && q.data && q.data.startsWith('l:')) {
      const lg = pick(q.data.slice(2)), nm = clean(q.from.first_name) || '👋';
      const base = { chat_id: q.message.chat.id, message_id: q.message.message_id, parse_mode: 'HTML', reply_markup: kb(lg) };
      await api('answerCallbackQuery', { callback_query_id: q.id });
      await api(q.message.photo ? 'editMessageCaption' : 'editMessageText', q.message.photo ? { ...base, caption: T[lg].wel(nm) } : { ...base, text: T[lg].hi(nm) });
      return new Response('OK');
    }
    if (q && q.data && q.data.startsWith('f:') && env.KV) {
      const lg = pick(q.from.language_code), key = 'in:' + q.from.id;
      const list = JSON.parse((await env.KV.get(key)) || '[]'), e = list.find(x => String(x.ts) === q.data.slice(2));
      if (!e) { await api('answerCallbackQuery', { callback_query_id: q.id, text: T[lg].late, show_alert: true }); return new Response('OK'); }
      e.t = e.t === 'in' ? 'out' : 'in';
      await env.KV.put(key, JSON.stringify(list));
      await api('answerCallbackQuery', { callback_query_id: q.id });
      await api('editMessageText', { chat_id: q.message.chat.id, message_id: q.message.message_id, text: T[lg].ok(f(e.a), e.t, cn(e.c, lg), e.l4),
        reply_markup: { inline_keyboard: [[{ text: T[lg].flip, callback_data: 'f:' + e.ts }]] } });
      return new Response('OK');
    }

    const m = u.message;
    if (!m) return new Response('OK');
    const lg = pick(m.from && m.from.language_code), cid = m.chat.id;
    let text = (m.text || '').trim();

    if (/^\/(start|help)/.test(text)) {
      const nm = clean(m.from.first_name) || '👋';
      if (text.startsWith('/start')) await api('sendPhoto', { chat_id: cid, photo: env.APP_URL + 'icons/icon-512.png', parse_mode: 'HTML', caption: T[lg].wel(nm) });
      await api('sendMessage', { chat_id: cid, parse_mode: 'HTML', text: T[lg].hi(nm), reply_markup: kb(lg) });
      return new Response('OK');
    }
    if (/^\/(hisobot|report|otchet)/.test(text)) {
      const sn = env.KV ? JSON.parse((await env.KV.get('snap:' + m.from.id)) || 'null') : null;
      const inb = env.KV ? JSON.parse((await env.KV.get('in:' + m.from.id)) || '[]') : [];
      await api('sendMessage', { chat_id: cid, parse_mode: 'HTML', text: sn ? report(sn, inb) : T[lg].nosnap });
      return new Response('OK');
    }
    if (m.voice || m.audio) {
      try { text = await stt(env, api, (m.voice || m.audio).file_id, lg); } catch { text = ''; }
      if (!text) { await api('sendMessage', { chat_id: cid, text: T[lg].nov }); return new Response('OK'); }
    }
    const rm = text && parseRem(text);
    if (rm && env.KV) {
      const id = Date.now(), k1 = 'bt:' + m.from.id, k2 = 'in:' + m.from.id;
      const bt = JSON.parse((await env.KV.get(k1)) || '[]'); bt.push({ id, n: rm.n, d: rm.d, lg });
      const ib = JSON.parse((await env.KV.get(k2)) || '[]'); ib.push({ k: 'task', id, n: rm.n, d: rm.d, ts: id });
      await env.KV.put(k1, JSON.stringify(bt.slice(-100))); await env.KV.put(k2, JSON.stringify(ib.slice(-200)));
      await api('sendMessage', { chat_id: cid, parse_mode: 'HTML', text: (m.voice ? `🎤 «${text}»\n\n` : '') + T[lg].rem(rm.w, clean(rm.n)) });
      return new Response('OK');
    }
    const e = text && parse(text);
    if (!e || !env.KV) { await api('sendMessage', { chat_id: cid, text: T[lg].bad }); return new Response('OK'); }
    const key = 'in:' + m.from.id, list = JSON.parse((await env.KV.get(key)) || '[]');
    const ts = Date.now();
    list.push({ ...e, ts });
    await env.KV.put(key, JSON.stringify(list.slice(-200)));
    await api('sendMessage', { chat_id: cid, text: (m.voice ? `🎤 «${text}»\n\n` : '') + T[lg].ok(f(e.a), e.t, cn(e.c, lg), e.l4),
      reply_markup: { inline_keyboard: [[{ text: T[lg].flip, callback_data: 'f:' + ts }]] } });
    return new Response('OK');
  },
};
