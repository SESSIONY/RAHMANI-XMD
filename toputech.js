const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8000;

// ═══════════════════════════════════════════
//   🛡️ MIDDLEWARE (Zima kuwekwa kwanza)
// ═══════════════════════════════════════════
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('events').EventEmitter.defaultMaxListeners = 500;

// Serve static files (CSS, JS, Images zote zilizopo kwenye folda)
app.use(express.static(__dirname));

// ═══════════════════════════════════════════
//   📱 ROUTES
// ═══════════════════════════════════════════
const qrRouter = require('./qr');
const pairRouter = require('./pair');

app.use('/qr', qrRouter);
app.use('/code', pairRouter);

// Pair Page
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

// Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ═══════════════════════════════════════════
//   🚀 START SERVER
// ═══════════════════════════════════════════
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   ⚡ RAHMANI-XMD PAIRING SERVER ⚡       ║
╚══════════════════════════════════════════╝

🚀 Server is running on port: ${PORT}
🌐 Local URL: http://localhost:${PORT}
📱 Pair Page: /pair
🔑 Pair API: /code
📷 QR API: /qr
🏠 Home: /

✅ Ready to receive requests!
`);
});

module.exports = app;
