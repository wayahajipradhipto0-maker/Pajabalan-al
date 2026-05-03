const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
const fs = require('fs')
const { exec } = require('child_process')
const pino = require('pino')

// ====== CONFIG WAJIB GANTI SEBELUM JALAN ======
const NOMOR_DANA = '081234567890' // Ganti nomor DANA lu buat.qris
const NAMA_STORE = 'STORE PAJABALAM' // Ganti nama toko lu
global.owner = ['628xxx'] // Ganti nomor WA lu pake 62. Bisa nambah: ['628xxx','628yyy']
global.mode = 'public' // 'public' = semua bisa pake, 'self' = cuma owner
// ============================================

// Auto bikin folder database
if(!fs.existsSync('./database')) fs.mkdirSync('./database')
if(!fs.existsSync('./database/user.json')) fs.writeFileSync('./database/user.json', JSON.stringify([]))
if(!fs.existsSync('./database/ban.json')) fs.writeFileSync('./database/ban.json', JSON.stringify([]))

let db_user = JSON.parse(fs.readFileSync('./database/user.json'))
let db_ban = JSON.parse(fs.readFileSync('./database/ban.json'))

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesi_pajabalam')
    const bot = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Pajabalam-AI', 'Chrome', '112.0.5615.49'],
        markOnlineOnConnect: false
    })

    bot.ev.on('creds.update', saveCreds)

    bot.ev.on('connection.update', (update) => {
        const { qr, connection, lastDisconnect } = update
        if(qr) {
            console.log('SCAN QR PAKE WA NOMOR KE-2:')
            qrcode.generate(qr, {small: true})
        }
        if(connection === 'open') {
            console.log('✅ BOT ONLINE - Pajabalam-AI V3')
            console.log('Owner:', global.owner)
            console.log('Mode:', global.mode)
        }
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Reconnect:', shouldReconnect)
            if(shouldReconnect) startBot()
            else console.log('Logout. Hapus folder sesi_pajabalam buat login ulang')
        }
    })

    bot.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0]
            if(!m.message || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return

            const from = m.key.remoteJid
            const isGroup = from.endsWith('@g.us')
            const sender = isGroup? m.key.participant : from
            const senderNumber = sender.split('@')[0]
            const isOwner = global.owner.includes(senderNumber)
            const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || ""
            const args = body.trim().split(/ +/).slice(1)
            const text = args.join(" ")
            const command = body.trim().split(/ +/)[0].toLowerCase()
            const pushname = m.pushName || 'Bos'

            // Save user ke database
            if(!db_user.includes(sender) &&!isGroup) {
                db_user.push(sender)
                fs.writeFileSync('./database/user.json', JSON.stringify(db_user, null, 2))
            }

            if(db_ban.includes(sender)) return // User di-ban
            if(global.mode === 'self' &&!isOwner) return // Mode self = cuma owner
            if(!body.startsWith('.')) return

            await bot.sendMessage(from, { react: { text: '🔥', key: m.key } })

            switch(command) {
                // ===== FITUR PUBLIK 16 BIJI =====
                case '.menu':
                case '.help':
                    let menu = `*${NAMA_STORE} 🔥*\nHalo ${pushname}\nTotal User: ${db_user.length}\n\n*FITUR PUBLIK:*\n`
                    menu += `.code <request> - Bantu ngoding HTML/CSS/JS\n`
                    menu += `.dl <link> - Download YT/TikTok/IG/FB MP4\n`
                    menu += `.tebak - Tebak-tebakan lucu\n`
                    menu += `.bisnis - Ide cuan modal HP\n`
                    menu += `.store - List produk digital\n`
                    menu += `.lirik <judul> - Cuplikan lirik lagu\n`
                    menu += `.rekomen - Rekomendasi film/game/anime\n`
                    menu += `.stiker - Foto/video jadi stiker WA\n`
                    menu += `.foto <prompt> - Generate gambar AI\n`
                    menu += `.game - Main suit vs bot\n`
                    menu += `.cuaca <kota> - Info cuaca real-time\n`
                    menu += `.qris <nominal> -
