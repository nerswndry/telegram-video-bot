const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = "8559195515:AAGpdcpHqmIW7Y65dKZ-opacQGRVEpQ77qk";
const ADMIN_ID = 1003606227254; // apna user id

const bot = new TelegramBot(TOKEN, { polling: true });

// Load saved codes
let videoDB = {};
if (fs.existsSync('videos.json')) {
  videoDB = JSON.parse(fs.readFileSync('videos.json'));
}

// Save function
function saveDB() {
  fs.writeFileSync('videos.json', JSON.stringify(videoDB, null, 2));
}

// Start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `👋 Hi dear ${msg.from.first_name},\n\nHow can I help you?\n\n🔐 Please send the code to find your video.`
  );
});

// ADMIN COMMAND → ADD CODE
bot.onText(/\/addcode (.+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "❌ Not authorized.");
  }

  const [code, channel, messageId] = match[1].split(" ");
  videoDB[code.toUpperCase()] = {
    channel,
    message_id: Number(messageId)
  };

  saveDB();
  bot.sendMessage(msg.chat.id, `✅ Code ${code} saved successfully.`);
});

// USER CODE
bot.on("message", async (msg) => {
  const code = msg.text?.toUpperCase();
  if (!videoDB[code]) return;

  const data = videoDB[code];
  const sent = await bot.copyMessage(
    msg.chat.id,
    data.channel,
    data.message_id,
    { protect_content: true }
  );

  // 24 hours delete
  setTimeout(() => {
    bot.deleteMessage(msg.chat.id, sent.message_id);
  }, 86400000);
});