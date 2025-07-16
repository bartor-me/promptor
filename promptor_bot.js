const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

bot.onText(/^\/(plan|email|idea|script)\s+(.+)/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1];
  const promptText = match[2];

  const prompts = {
    plan: `Составь контент-план на 7 дней для ${promptText}. Формат: день, идея, короткий текст и хэштеги.`,
    email: `Напиши email-рассылку на тему: "${promptText}". Формат: тема письма, заголовок, тело, призыв к действию.`,
    idea: `Придумай 5 идей для постов в Telegram по теме: "${promptText}".`,
    script: `Напиши сценарий для короткого видео в TikTok на тему: "${promptText}". Формат: кадры, текст, стиль.`
  };

  const system = 'Ты — профессиональный маркетолог и копирайтер, работаешь быстро и даёшь готовый текст без воды.';

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompts[command] }
      ],
      model: 'gpt-4o'
    });

    bot.sendMessage(chatId, `✅ Готово:\n\n${response.choices[0].message.content}`);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ GPT не сработал: ${error.message}`);
  }
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Привет! Я Promptor 🤖

📆 /plan instagram кофейня — контент-план
✉️ /email запуск курса — email-рассылка
💡 /idea telegram маркетинг — идеи постов
🎥 /script tiktok мотивация — сценарий видео

Попробуй любую команду!`);
});