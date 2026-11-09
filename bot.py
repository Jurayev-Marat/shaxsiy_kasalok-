import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# 1. BotFather'dan olgan bot tokeningizni shu yerga qo'ying:
BOT_TOKEN = "9138986921:AAFgqhudwy-eDuY-cS7fg_Qadcb3sNSSJhk"

# 2. GitHub'ga yuklagan ilovangiz manzilini shu yerga qo'ying:
WEBAPP_URL = "https://jurayev-marat.github.io/shaxsiy_kasalok-/"

dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    guide_text = (
        "🌟 <b>JM Hamyon — Shaxsiy moliya yordamchingizga xush kelibsiz!</b>\n\n"
        "Ushbu ilova orqali daromad, xarajat, qarzlar va kunlik rejalaringizni boshqaring.\n\n"
        "💳 <b>Hisoblar:</b> Kartalar va naqd pulingizni qo'shing.\n"
        "🎤 <b>Aqlli kassa:</b> Xarajatlarni ovoz orqali yoki SMS dan nusxalab kiriting.\n"
        "🤝 <b>Qarz kitobi:</b> Qarz oldi-berdisi avtomatik karta balansingizga ta'sir qiladi.\n"
        "🛠 <b>Vositalar:</b> Vazifalar, qaydlar, taymer va kalkulyator bitta joyda.\n"
        "🛡 <b>Xavfsizlik:</b> PIN-kod o'rnating va ma'lumotlarni Excelga yuklab oling.\n\n"
        "👇 <i>Boshlash uchun pastdagi tugmani bosing!</i>"
    )

    # Web App'ni ochuvchi tugma
    markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 JM Hamyonni ochish", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])

    await message.answer(text=guide_text, parse_mode="HTML", reply_markup=markup)


async def main():
    bot = Bot(token=BOT_TOKEN)
    print("Bot ishga tushdi! Telegramdan /start bosib tekshirib ko'ring...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())