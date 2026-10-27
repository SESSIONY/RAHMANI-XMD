const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    delay
} = require("@whiskeysockets/baileys");

// Cleanup function
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();

    async function RAHMANI_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                markOnlineOnConnect: false,
                syncFullHistory: false,
                generateHighQualityLinkPreview: false
            });

            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                // Send QR Code image to browser
                if (qr) await res.end(await QRCode.toBuffer(qr));

                if (connection == "open") {
                    // Delay imepunguzwa ili kuepuka Heroku timeout
                    await delay(3000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(1000);
                    
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await sock.sendMessage(sock.user.id, { text: '' + b64data });

                    // Ujumbe mzuri wa Session
                    let RAHMANI_TEXT = `✅ *SESSION GENERATED SUCCESSFULLY*

┌─────────────────────
│  ⚡ *Bot Name:* RAHMANI-XMD
│  👤 *Owner:* Qartde
│
│  🔰 *Next Steps:*
│  ▸ Copy the Session ID above
│  ▸ Paste it into your deployment platform
│  ▸ Deploy your bot and enjoy!
│
│  📢 *Support & Links:*
│  ▸ Owner: wa.me/255693629079
│  ▸ Channel: whatsapp.com/channel/0029VatokI45EjxufALmY32X
│  ▸ Repo: github.com/Qartde/RAHMANI-XMD
│
└─────────────────────

⚠️ *Keep this session ID private!*`;

                    await sock.sendMessage(
                        sock.user.id,
                        { text: RAHMANI_TEXT },
                        { quoted: session }
                    );

                    await delay(100);
                    await sock.ws.close();
                    return await removeFile("./temp/" + id);

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    RAHMANI_QR_CODE();
                }
            });

        } catch (err) {
            console.log("QR Service Error:", err.message);
            if (!res.headersSent) {
                await res.json({ code: "Service is Currently Unavailable" });
            }
            await removeFile("./temp/" + id);
        }
    }

    return await RAHMANI_QR_CODE();
});

module.exports = router;