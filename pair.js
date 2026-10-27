const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

// 1. Cleanup function
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// 2. Main Router
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function RAHMANI_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS('Chrome'),
                markOnlineOnConnect: false,
                syncFullHistory: false,
                generateHighQualityLinkPreview: false
            });

            // Generate Pair Code
            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    // Delay imepunguzwa kutoka 50000 kwenda 5000 ili kuepuka Heroku timeout
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(2000);
                    
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await sock.sendMessage(
                        sock.user.id,
                        { text: '' + b64data }
                    );

                    // Ujumbe mzuri wa English (RAHMANI-XMD)
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
                        {
                            text: RAHMANI_TEXT,
                            contextInfo: {
                                mentionedJid: [sock.user.id],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363353854480831@newsletter",
                                    newsletterName: "⚡ RAHMANI-XMD CHANNEL ⚡",
                                    serverMessageId: 143
                                }
                            }
                        },
                        { quoted: session }
                    );

                    await delay(100);
                    await sock.ws.close();
                    return await removeFile('./temp/' + id);

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    RAHMANI_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("Service restarted due to error:", err.message);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    return await RAHMANI_PAIR_CODE();
});

module.exports = router;