import telebot
import sqlite3

# Yahan apna Bot Token aur Admin ID daalein
API_TOKEN = '8570437895:AAERRCl9F8A_PZgrUWT183ZsDuEyyZD_-uI'
ADMIN_ID = 6062006736
CHANNEL_ID = '@video_hub_04' 

bot = telebot.TeleBot(API_TOKEN)

# Database setup (Codes save karne ke liye)
def init_db():
    conn = sqlite3.connect('videos.db')
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS vids (code TEXT PRIMARY KEY, msg_id TEXT)')
    conn.commit()
    conn.close()

# Start Command
@bot.message_handler(commands=['start'])
def send_welcome(message):
    name = message.from_user.first_name
    bot.reply_to(message, f"Hi dear @{name}, How can I help you? Please send the code to find your video.")

# Admin: Code add karne ke liye (/add XT01 45)
@bot.message_handler(commands=['add'])
def add_video(message):
    if message.from_user.id == ADMIN_ID:
        try:
            _, code, msg_id = message.text.split()
            conn = sqlite3.connect('videos.db')
            cursor = conn.cursor()
            cursor.execute('INSERT OR REPLACE INTO vids VALUES (?, ?)', (code, msg_id))
            conn.commit()
            conn.close()
            bot.reply_to(message, f"✅ Done! Code: {code} linked to Message ID: {msg_id}")
        except:
            bot.reply_to(message, "❌ Format: /add CODE MSG_ID")

# User: Code check karne ke liye
@bot.message_handler(func=lambda message: True)
def get_video(message):
    user_code = message.text
    conn = sqlite3.connect('videos.db')
    cursor = conn.cursor()
    cursor.execute('SELECT msg_id FROM vids WHERE code=?', (user_code,))
    result = cursor.fetchone()
    conn.close()

    if result:
        # Video channel se copy karke user ko bhejna
        bot.copy_message(message.chat.id, CHANNEL_ID, result[0], protect_content=True)
    else:
        bot.reply_to(message, "❌ Invalid Code! Please try again.")

init_db()
bot.infinity_polling()
