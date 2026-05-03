Pajabalam-AI V3
Bot WhatsApp 15 Fitur + Owner Panel Buat Anak Riau

Fitur V3

Fitur Publik:
1. .menu - List fitur
2. .code - Bantu ngoding HTML CSS JS
3. .dl - Download YT TikTok IG FB MP4
4. .tebak - Tebak-tebakan lucu
5. .bisnis - Ide cuan modal HP
6. .store - Toko digital otomatis
7. .lirik - Cuplikan lirik lagu
8. .rekomen - Rekomendasi film game anime
9. .stiker - Foto video jadi stiker WA
10. .foto - Generate gambar AI dari teks
11. .game - Main suit vs bot
12. .cuaca - Info cuaca real-time
13. .qris - Generate QRIS DANA
14. .ai - Tanya AI gratis
15. .ping - Cek status dan speed bot
16. .owner - Info kontak owner

Fitur Owner Only:
17. .bc - Broadcast pesan ke semua user
18. .addowner - Tambah owner baru
19. .delowner - Hapus owner
20. .listuser - Liat total user bot
21. .ban - Block user yg spam
22. .unban - Unblock user
23. .mode - Ganti mode public atau self

Install Termux 1-Klik:
Buka Termux terus tempel:

bash <(curl -s https://raw.githubusercontent.com/wayahaji/Pajabalan-ai/main/install.sh)

Setting Wajib di bot.js:
Buka file bot.js terus ganti 3 ini:

const NOMOR_DANA = '081234567890'
const NAMA_STORE = 'STORE PAJABALAM'
global.owner = ['628xxx']

Ganti jadi nomor DANA lu, nama toko lu, nomor WA lu pake 62

Aturan Biar Gak Ke-Banned WA:
1. WAJIB pake nomor WA ke-2. Beli 10rb di konter
2. Jangan spam .bc tiap menit. Maks 1x sehari biar aman
3. Jangan buat nipu phising. Bot ini buat cuan halal
4. Folder sesi_pajabalam jangan di-share ke siapa-siapa
5. Kalo mau matiin bot: CTRL+C di Termux

Solusi Error:
1. QR Code ga muncul
Solusi: rm -rf sesi_pajabalam terus node bot.js lagi

2. .dl error yt-dlp not found
Solusi: pip install -U yt-dlp

3. Bot lemot ga bales
Solusi: Ketik .mode self terus .mode public lagi

4. Error database user.json
Solusi: mkdir database terus echo '[]' > database/user.json

5. Port already in use
Solusi: pkill node terus jalanin ulang

Catatan:
1. Bot ini gratis dan open source
2. Update rutin di repo ini
3. Resiko banned WA tanggung sendiri

By: Anak Pajabalam, Riau
