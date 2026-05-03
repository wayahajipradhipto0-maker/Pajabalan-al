#!/data/data/com.termux/files/usr/bin/bash
clear
echo "=================================="
echo " PAJABALAM-AI V3 INSTALLER 🔥"
echo " 15 Fitur + Owner Only + Anti Error"
echo "=================================="
sleep 2

echo "[1/4] Update Termux..."
pkg update -y && pkg upgrade -y
pkg install nodejs-lts git ffmpeg python -y
pip install -U yt-dlp

echo "[2/4] Clone Baileys..."
rm -rf botwa
git clone https://github.com/whiskeysockets/Baileys botwa
cd botwa
npm install qrcode-terminal axios pino

echo "[3/4] Download bot.js..."
curl -o bot.js https://raw.githubusercontent.com/USERNAME_LU/Pajabalam-AI/main/bot.js
mkdir database
echo '[]' > database/user.json
echo '[]' > database/ban.json

echo "[4/4] Bikin shortcut..."
echo 'cd ~/botwa && node bot.js' > ~/bot-pajabalam.sh
chmod +x ~/bot-pajabalam.sh

clear
echo "✅ INSTALL SELESAI BOS"
echo "Jalanin: bash bot-pajabalam.sh"
echo "Scan QR pake WA nomor ke-2"
