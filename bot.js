const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
const fs = require('fs')
const { exec } = require('child_process')
const pino = require('pino')

// ====== CONFIG WAJIB GANTI ======
const NOMOR_DANA = '081234567890' // Ganti nomor DANA lu
const NAMA_STORE = 'STORE PAJABALAM' // Ganti nama toko lu
global.owner = ['628xxx'] // Ganti nomor WA lu, pake 62. Contoh: ['6281234567890','6281111111111']
global.mode = 'public' // 'public' = semua bisa pake, 'self' = cuma owner
// ================================

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
        if(connection === 'open') console.log('✅ BOT ONLINE - Pajabalam-AI V3')
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Reconnect:', shouldReconnect)
            if(shouldReconnect) startBot()
            else console.log('Logout. Hapus folder sesi_pajabalam')
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

            // Database user
            if(!db_user.includes(sender) &&!isGroup) {
                db_user.push(sender)
                fs.writeFileSync('./database/user.json', JSON.stringify(db_user, null, 2))
            }

            if(db_ban.includes(sender)) return
            if(global.mode === 'self' &&!isOwner) return
            if(!body.startsWith('.')) return

            await bot.sendMessage(from, { react: { text: '🔥', key: m.key } })

            switch(command) {
                // ===== FITUR PUBLIK =====
                case '.menu':
                case '.help':
                    let menu = `*${NAMA_STORE} 🔥*\nHalo ${pushname}\n\n*FITUR PUBLIK:*\n`
                    menu += `.code <request> - Bantu ngoding\n`
                    menu += `.dl <link> - Download YT/TikTok/IG/FB\n`
                    menu += `.tebak - Tebak-tebakan lucu\n`
                    menu += `.bisnis - Ide cuan 15 tahun\n`
                    menu += `.store - List produk digital\n`
                    menu += `.lirik <judul> - Cuplikan lirik\n`
                    menu += `.rekomen - Rekomendasi film/game\n`
                    menu += `.stiker - Foto/video jadi stiker\n`
                    menu += `.foto <prompt> - Bikin gambar AI\n`
                    menu += `.game - Main suit\n`
                    menu += `.cuaca <kota> - Info cuaca\n`
                    menu += `.qris <nominal> - QRIS DANA\n`
                    menu += `.ai <tanya> - Tanya AI gratis\n`
                    menu += `.ping - Cek status bot\n`
                    menu += `.owner - Hubungi owner\n\n`
                    if(isOwner) {
                        menu += `*FITUR OWNER:*\n`
                        menu += `.bc <teks> - Broadcast all user\n`
                        menu += `.addowner 62xxx - Tambah owner\n`
                        menu += `.delowner 62xxx - Hapus owner\n`
                        menu += `.listuser - Total user bot\n`
                        menu += `.ban 62xxx - Block user\n`
                        menu += `.unban 62xxx - Unblock user\n`
                        menu += `.mode public/self - Ganti mode\n`
                    }
                    menu += `\n*Contoh:.dl https://youtu.be/dQw4w9WgXcQ*`
                    await bot.sendMessage(from, {text: menu})
                    break

                case '.ping':
                    const start = new Date().getTime()
                    await reply('Testing ping...')
                    const end = new Date().getTime()
                    reply(`✅ *Bot Online*\nSpeed: ${end - start}ms\nMode: ${global.mode}\nTotal User: ${db_user.length}\nRuntime: ${runtime(process.uptime())}`)
                    break

                case '.owner':
                    reply(`*Owner ${NAMA_STORE}*\nWA: wa.me/${global.owner[0]}\nJangan spam ya bos 🙏`)
                    break

                case '.code':
                    if(!text) return reply('Contoh:.code bikin login page html tailwind')
                    reply(`*HASIL CODE: ${text}*\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head>\n<script src="https://cdn.tailwindcss.com"></script>\n<title>Login Pajabalam</title>\n</head>\n<body class="bg-gray-900 flex items-center justify-center h-screen">\n<div class="bg-gray-800 p-8 rounded-lg">\n<h2 class="text-white text-2xl mb-4">Login</h2>\n<input class="mb-2 p-2 rounded w-full" placeholder="Username">\n<input type="password" class="mb-4 p-2 rounded w-full" placeholder="Password">\n<button class="bg-blue-600 text-white p-2 rounded w-full">Login</button>\n</div>\n</body>\n</html>\n\`\`\`\n\nMau kode lain?.code + request`)
                    break

                case '.dl':
                    if(!text) return reply('Tempel link. Contoh:.dl https://vt.tiktok.com/ZSjCn2jY/')
                    if(!isUrl(text)) return reply('Link salah bos')
                    reply('⏳ Download... Max 2 menit')
                    exec(`yt-dlp -f "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/b" --merge-output-format mp4 --no-playlist -o "video.mp4" "${text}"`, async (err) => {
                        if(err ||!fs.existsSync('./video.mp4')) return reply('❌ Gagal. Link private/umur/terlalu panjang')
                        let stats = fs.statSync('./video.mp4')
                        if(stats.size > 95000000) {
                            fs.unlinkSync('./video.mp4')
                            return reply('❌ Video >95MB. Kegedean buat WA')
                        }
                        await bot.sendMessage(from, {video: fs.readFileSync('./video.mp4'), caption: `✅ Download by ${NAMA_STORE}`})
                        fs.unlinkSync('./video.mp4')
                    })
                    break

                case '.tebak':
                    const soal = [
                        'Benda apa yg kalo dipotong malah tinggi? *J: Celana*',
                        'Malam apa yg paling horor? *J: Malam-malam merindukanmu*',
                        'Kenapa ayam nyebrang ga noleh? *J: Ga punya SIM*',
                        'Apa bedanya kamu sama lukisan? *J: Kalo lukisan makin lama makin antik, kalo kamu makin lama makin cantik*'
                    ]
                    reply(`*TEBAK-TEBAKAN PAJABALAM* 😂\n\n${soal[Math.floor(Math.random()*soal.length)]}`)
                    break

                case '.bisnis':
                    reply(`*IDE CUAN MODAL HP 15 TAHUN* 💰\n\n1. *Jual DJ 5rb* - Pake fitur.store bot ini\n2. *Joki Canva* - 10-25rb/desain\n3. *Jasa Download* - 2rb/file pake.dl\n4. *Stiker WA Custom* - 5rb/10 stiker pake.stiker\n5. *Reseller Kuota* - Daftar di Digipos/Orderkuota\n6. *Joki Rank ML/FF* - 5rb/bintang\n\nMau contoh promosi?.iklan DJ`)
                    break

                case '.store':
                    reply(`*${NAMA_STORE}*\n\n*PRODUK DIGITAL:*\n1. DJ Viral Full Bass 2026 - 5.000\n2. Preset Jedag Jedug AM XML - 10.000\n3. Akun Canva Pro 1 Bulan - 15.000\n4. Nomor Kosong WA - 12.000\n5. Script Bot WA - 50.000\n\n*ORDER:*\n1. TF DANA: ${NOMOR_DANA}\n2. Kirim bukti TF ke sini\n3. File auto kirim\n\nKetik.order 1 buat beli DJ`)
                    break

                case '.lirik':
                    if(!text) return reply('Contoh:.lirik Nemen NDX')
                    reply(`*LIRIK ${text.toUpperCase()}*\n\nCuplikan aja bos 🙏\n"..." \n\n*Full lirik:*\nhttps://google.com/search?q=lirik+${text.replace(/ /g,'+')}`)
                    break

                case '.rekomen':
                    reply(`*REKOMEN BUAT ${pushname}*\n\n*Film Indo:* Agak Laen, Vina, Siksa Kubur, Badarawuhi\n*Game Ringan:* Dream League 2019, GTA SA Lite, Efootball 24\n*Youtuber:* Windah, Miawaug, Frost Diamond, Budi01\n*Lagu Viral:* Berakhir Sudah - Stand Here Alone, Nemen - NDX\n*Anime:* One Piece, Jujutsu Kaisen, Demon Slayer`)
                    break

                case '.stiker':
                case '.s':
                    if(!m.message.imageMessage &&!m.message.videoMessage) return reply('Reply foto/video + caption.stiker')
                    reply('⏳ Bikin stiker...')
                    const buffer = await downloadMediaMessage(m, 'buffer', {})
                    await bot.sendMessage(from, {sticker: buffer})
                    break

                case '.foto':
                    if(!text) return reply('Contoh:.foto RX King hitam modif di kebun sawit malam, cinematic 4k')
                    reply('🎨 Generate gambar AI... 20 detik')
                    try {
                        await bot.sendMessage(from, {image: {url: `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true`}, caption: `*Prompt: ${text}*\n\nGenerated by ${NAMA_STORE}`})
                    } catch {
                        reply('Server AI lagi error. Coba prompt lain')
                    }
                    break

                case '.game':
                    reply('*GAME SUIT* ✊✌️✋\n\nLawan bot hoki!\nKetik:.suit batu\nKetik:.suit gunting\nKetik:.suit kertas')
                    break

                case '.suit':
                    if(!args[0]) return reply('Pilih:.suit batu/gunting/kertas')
                    const pilihan = ['batu','gunting','kertas']
                    const botPilih = pilihan[Math.floor(Math.random()*3)]
                    const user = args[0].toLowerCase()
                    if(!pilihan.includes(user)) return reply('Cuma bisa batu/gunting/kertas')
                    let hasil = 'Seri 😐'
                    if(user=='batu'&&botPilih=='gunting' || user=='gunting'&&botPilih=='kertas' || user=='kertas'&&botPilih=='batu') hasil = 'Lu Menang 🔥'
                    if(user=='batu'&&botPilih=='kertas' || user=='gunting'&&botPilih=='batu' || user=='kertas'&&botPilih=='gunting') hasil = 'Bot Menang 😜'
                    reply(`Lu: ${user}\nBot: ${botPilih}\n\n*${hasil}*`)
                    break

                case '.cuaca':
                    const kota = text || 'Pajabalam'
                    try {
                        const { data } = await axios.get(`https://wttr.in/${kota}?format=3`)
                        reply(`*CUACA ${kota.toUpperCase()}*\n${data}\n\nDetail: https://wttr.in/${kota}`)
                    } catch {
                        reply('Kota gak ketemu. Contoh:.cuaca Pekanbaru')
                    }
                    break

                case '.qris':
                    if(!text) return reply('Contoh:.qris 5000')
                    const nominal = text.replace(/\D/g,'')
                    if(nominal < 1000) return reply('Minimal Rp 1.000')
                    reply(`*QRIS Rp${Number(nominal).toLocaleString('id-ID')}*\nDANA: ${NOMOR_DANA}\nAtas nama: ${NAMA_STORE}`)
                    await bot.sendMessage(from, {image: {url: `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021126690014ID.DANA.WWW011893600914${NOMOR_DANA}0209${NAMA_STORE}520458125303360540${nominal}5802ID5920${NAMA_STORE}6007RIAU61054000062070703A016304`}})
                    break

                case '.ai':
                    if(!text) return reply('Contoh:.ai cara biar jago main ff')
                    reply('🤖 Pajabalam-AI mikir...')
                    try {
                        const { data } = await axios.get(`https://api.kenzap.space/ai?text=${encodeURIComponent(text)}`, {timeout: 20000})
                        reply(data.result)
                    } catch {
                        reply('AI lagi lemot/error. Coba 1 menit lagi')
                    }
                    break

                // ===== FITUR OWNER ONLY =====
                case '.bc':
                case '.broadcast':
                    if(!isOwner) return reply('❌ Khusus Owner')
                    if(!text) return reply('Contoh:.bc Promosi DJ 5rb hari ini aja!')
                    let pesan = `*BROADCAST ${NAMA_STORE}*\n\n${text}\n\n_Reply pesan ini untuk order_`
                    let sukses = 0
                    reply(`⏳ Kirim broadcast ke ${db_user.length} user...`)
                    for(let user of db_user) {
                        await sleep(2000)
                        try {
                            await bot.sendMessage(user, {text: pesan})
                            sukses++
                        } catch {}
                    }
                    reply(`✅ Broadcast sukses ke ${sukses}/${db_user.length} user`)
                    break

                case '.addowner':
                    if(!isOwner) return reply('❌ Khusus Owner')
                    if(!args[0]) return reply('Contoh:.addowner 6281234567890')
                    let nomorBaru = args[0].replace(/\D/g,'')
                    if(global.owner.includes(nomorBaru)) return reply('Udah jadi owner bos')
                    global.owner.push(nomorBaru)
                    reply(`✅ ${nomorBaru} jadi owner baru\nTotal owner: ${global.owner.length}`)
                    break

                case '.delowner':
                    if(!isOwner) return reply('❌ Khusus Owner')
                    if(!args[0]) return reply('Contoh:.delowner 6281234567890')
                    let nomorHapus = args[0].replace(/\D/g,'')
                    if(nomorHapus === senderNumber) return reply('Gabisa hapus diri sendiri')
                    let indexOwner = global.owner.indexOf(nomorHapus)
                    if(indexOwner == -1) return reply('Nomor bukan owner')
                    global.owner.splice(indexOwner, 1)
                    reply(`✅ ${nomorHapus} dihapus dari owner`)
                    break

                case '.listuser':
                    if(!isOwner) return reply('❌ Khusus Owner')
                    let list = `*TOTAL USER: ${db_user.length}*\n\n`
                    db_user.slice(0, 50).forEach((u, i) => {
                        list += `${i+1}. wa.me/${u.split('@')[0]}\n`
                    })
                    if(db_user.length > 50) list += `\n...dan ${db_user.length - 50} lainnya`
                    reply(list)
                    break

                case '.ban':
                    if(!isOwner) return reply('❌ Khusus Owner')
                    if(!args[0]) return reply('Contoh:.ban 6281234567890')
                    let targetBan = args[0].replace(/\D/g,'') + '@s.whatsapp.net'
                    if(db_ban.includes(targetBan)) return reply('Udah di-ban')
                    db_ban.push(targetBan)
                    fs.writeFileSync('./database/ban.json', JSON.stringify(db_ban, null, 2))
                    reply(`✅ ${args[0]} kena ban. Gabisa pake bot lagi`)
                    break

                case '.unban':
                    if(!isOwner) return reply('❌ Khusus Owner')
                    if(!args[0]) return reply('Contoh:.unban 6281234567890')
                    let targetUnban = args[0].replace(/\D/g,'') + '@s.whatsapp.net'
                    let index = db_ban.indexOf(targetUnban)
                    if(index == -1) return reply('Nomor ga di-ban')
                    db_ban.splice(index, 1)
                    fs.writeFileSync('./database/ban.json', JSON.stringify(db_ban, null, 2))
                    reply(`✅ ${args[0]} udah di-unban`)
                    break

                case '.mode':
                    if(!isOwner) return reply('❌ Khusus Owner')
                    if(!args[0]) return reply('Pilih:.mode public atau.mode self\n\npublic = semua bisa pake\nself = cuma owner')
                    if(args[0] === 'public' || args[0] === 'self') {
                        global.mode = args[0]
                        reply(`✅ Mode bot: *${args[0]}*`)
                    } else {
                        reply('Cuma bisa public/self')
                    }
                    break

                default:
                    reply('Command gak ada. Ketik.menu')
            }

            function reply(teks) {
                bot.sendMessage(from, {text: teks}, {quoted: m})
            }

        } catch (err) {
            console.log('Error:', err)
        }
    })
}

function isUrl(url) {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function runtime(seconds) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor(seconds % (3600 * 24) / 3600)
    var m = Math.floor(seconds % 3600 / 60)
    var s = Math.floor(seconds % 60)
    return `${d} hari ${h} jam ${m} menit ${s} detik`
}

startBot()
