const TelegramBot = require('node-telegram-bot-api');

const TOKEN = "8559195515:AAGpdcpHqmIW7Y65dKZ-opacQGRVEpQ77qk";

const bot = new TelegramBot(TOKEN, { polling: true });

// 🔐 VIDEO CODE DATABASE
const videoDB = {
  "DEMO123": {
    channel: "@video_hub_04",
    message_id: 105
  }
};

// /start message
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "Dear User";
  bot.sendMessage(
    msg.chat.id,
    `👋 Hi dear ${name},\n\nHow can I help you?\n\n🔐 Please send the code to find your video.`
  );
});

// code listener
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const code = msg.text?.toUpperCase();

  if (!videoDB[code]) return;

  const data = videoDB[code];

  const sent = await bot.copyMessage(
    chatId,
    data.channel,
    data.message_id,
    { protect_content: true }
  );

  // ⏱️ 24 hours = 86400000 ms
  setTimeout(() => {
    bot.deleteMessage(chatId, sent.message_id);
  }, 86400000);
});