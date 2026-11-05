// Cloudflare Worker — Telegram bot: /start da mini ilovani taklif qiladi (UZ / RU / EN)
// O'zgaruvchilar: BOT_TOKEN, APP_URL (https://username.github.io/reja/ — oxirida / bilan)

const T = {
  uz: {
    hi: n => `Salom, <b>${n}</b>! 👋\n\n<b>Shaxsiy Reja</b> — kartalaringiz, kasholak, qarzlar va kundalik ishlaringiz bir joyda.\n\n🚀 Mini ilovadan hoziroq foydalanamizmi?`,
    open: '🚀 Ilovani ochish',
    help: "<b>Nima qila olaman?</b>\n\n💳 Kartalar va naqd pul qoldig'i\n💰 Oylik va boshqa daromadlar\n🤝 Qarz oldim / qarz berdim\n🎯 Jamg'arma maqsadlari\n⏰ Kunlik, oylik, yillik eslatmalar\n\nBoshlash uchun tugmani bosing 👇",
  },
  ru: {
    hi: n => `Привет, <b>${n}</b>! 👋\n\n<b>Личный план</b> — карты, кошелёк, долги и ежедневные дела в одном месте.\n\n🚀 Открыть мини-приложение прямо сейчас?`,
    open: '🚀 Открыть приложение',
    help: '<b>Что я умею?</b>\n\n💳 Остатки на картах и наличные\n💰 Зарплата и другие доходы\n🤝 Я взял в долг / я дал в долг\n🎯 Цели накоплений\n⏰ Ежедневные, ежемесячные, ежегодные напоминания\n\nНажмите кнопку, чтобы начать 👇',
  },
  en: {
    hi: n => `Hi, <b>${n}</b>! 👋\n\n<b>Personal Planner</b> — your cards, wallet, debts and daily tasks in one place.\n\n🚀 Open the mini app right now?`,
    open: '🚀 Open the app',
    help: "<b>What can I do?</b>\n\n💳 Card and cash balances\n💰 Salary and other income\n🤝 I borrowed / I lent\n🎯 Savings goals\n⏰ Daily, monthly, yearly reminders\n\nTap the button to start 👇",
  },
};

const pick = c => (/^ru/.test(c || '') ? 'ru' : /^en/.test(c || '') ? 'en' : 'uz');

export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('Bot ishlayapti ✅');
    let u;
    try { u = await req.json(); } catch { return new Response('OK'); }

    const api = (method, body) =>
      fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    const kb = lg => ({
      inline_keyboard: [
        [{ text: T[lg].open, web_app: { url: `${env.APP_URL}?lang=${lg}` } }],
        [
          { text: "🇺🇿 O'zbekcha", callback_data: 'l:uz' },
          { text: '🇷🇺 Русский', callback_data: 'l:ru' },
          { text: '🇬🇧 English', callback_data: 'l:en' },
        ],
      ],
    });
    const clean = s => String(s || '').replace(/[<>&]/g, '');

    // Til tugmasi bosilganda xabarni shu tilda yangilaydi
    const q = u.callback_query;
    if (q && q.data && q.data.startsWith('l:')) {
      const lg = pick(q.data.slice(2));
      const text = T[lg].hi(clean(q.from.first_name) || '👋');
      const base = { chat_id: q.message.chat.id, message_id: q.message.message_id, parse_mode: 'HTML', reply_markup: kb(lg) };
      await api('answerCallbackQuery', { callback_query_id: q.id });
      await api(q.message.photo ? 'editMessageCaption' : 'editMessageText', q.message.photo ? { ...base, caption: text } : { ...base, text });
      return new Response('OK');
    }

    const m = u.message;
    if (!m) return new Response('OK');
    const lg = pick(m.from && m.from.language_code);
    const text = (m.text || '').trim();

    if (text.startsWith('/help')) {
      await api('sendMessage', { chat_id: m.chat.id, parse_mode: 'HTML', text: T[lg].help, reply_markup: kb(lg) });
    } else {
      const caption = T[lg].hi(clean(m.from && m.from.first_name) || '👋');
      const r = await api('sendPhoto', {
        chat_id: m.chat.id,
        photo: env.APP_URL + 'icons/icon-512.png',
        parse_mode: 'HTML',
        caption,
        reply_markup: kb(lg),
      });
      if (!r.ok) await api('sendMessage', { chat_id: m.chat.id, parse_mode: 'HTML', text: caption, reply_markup: kb(lg) });
    }
    return new Response('OK');
  },
};
