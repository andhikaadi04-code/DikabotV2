# play-bot

Bot WhatsApp minimalis, cuma buat 1 fitur: `.play2 <judul lagu>`.
Tidak ada menu, tidak ada fitur lain — cuma plugin `play.js` yang kamu kasih, dijalankan apa adanya.

## Cara pakai — Pterodactyl / hosting panel

1. Upload semua isi folder ini ke server (lewat tab **Files**).
2. Sebelum start, buka tab **Console**, ketik satu-satu (kalau muncul warning `allow-scripts` seperti punyamu):
   ```bash
   npm install-scripts approve sharp
   npm install-scripts approve @itsliaaa/baileys
   npm install-scripts approve protobufjs
   npm install-scripts approve @biomejs/biome
   npm install
   ```
3. (Opsional tapi disarankan) Set environment variable **`PAIRING_NUMBER`** lewat tab **Startup**/**Variables**, isi nomor WA kamu format `628xxxxxxxxxx`. Ini biar bot gak perlu nanya interaktif — soalnya beberapa panel gak selalu ngirim balik input console dengan mulus.
   - Kalau env var ini gak diisi, bot tetap akan nanya nomornya lewat kolom `Type a command...` pas pertama kali jalan.
4. Klik **Start**. Setelah connect, kode pairing bakal muncul di console — buka WhatsApp: `Setelan → Perangkat Tertaut → Tautkan dengan nomor telepon`, masukkan kodenya.
5. Sesi tersimpan di folder `session/`, jadi restart berikutnya gak perlu pairing ulang (jangan hapus folder ini pas backup/redeploy).

## Cara pakai — Termux / Android

```bash
pkg update && pkg upgrade
pkg install nodejs-lts ffmpeg -y

# WAJIB: taruh project di home Termux, JANGAN di /storage/emulated/0
# (folder shared storage gak support symlink, npm install bakal error EACCES)
cd ~/play-bot
npm install
npm start
```

Kalau muncul error `Could not load the "sharp" module using the android-arm64 runtime`,
itu karena `sharp` gak resmi didukung di Termux. Ganti dependency ini pakai `jimp` (pure JS, tanpa binary native):

```bash
npm uninstall sharp
npm install jimp
```

Lalu di `plugins/play.js`, ganti `import sharp from 'sharp'` jadi `import { Jimp } from 'jimp'`,
dan di fungsi `getThumb`, ganti baris `sharp(...)` jadi:
```js
const image = await Jimp.read(raw)
image.cover({ w: 250, h: 250 })
return await image.getBuffer('image/jpeg', { quality: 50 })
```

## Command

```
.play2 judul lagu
```

Contoh: `.play2 blue yungkai`

## Catatan

- Prefix default `.` — bisa diganti di `index.js`, cari `const PREFIX = '.'`.
- Plugin `play.js` pakai `richResponseMessage` (nyamar sebagai fitur AI bot resmi WhatsApp) buat nampilin player HTML interaktif. Ini trik tidak resmi — bisa berhenti kerja kapan saja kalau WhatsApp ubah struktur internal, dan berisiko akun kena flag karena bukan cara resmi.
- Kalau `ffmpeg` belum terinstall di sistem, proses kompres audio bakal gagal dengan error `FFmpeg tidak ditemukan`.
