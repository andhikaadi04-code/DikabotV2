'use strict'

import { randomUUID } from 'crypto'

/* =========================================================
 * KONFIGURASI — EDIT SEMUA DI SINI
 * ========================================================= */

// Foto & background (isi link gambar kamu, ikuti tutorial upload
// video/media yang udah pernah dipakai — taruh di /root/media/ di VPS
// terus akses lewat http://157.230.35.6/media/nama-file.jpg)
const BANNER_URL = '' // gambar banner/background atas (ideal 1200x600px)
const AVATAR_URL = '' // foto profil bulat (ideal 400x400px, persegi)

const NAME = 'Azka'
const AGE = '15 Tahun'
const EXPERIENCE = '1 Hari 🧢'
const ROLE_TAG = 'VIBE CODER'
const STREET_SIGN = 'VIBE CODER ST'
const SUBTITLE = 'Vibe Coding & Prompt Engineering'
const PROJECT_COUNT = '784+'

// Skill (logo asli via devicon CDN — cukup ganti nama tekniknya)
// icon pakai emoji (bukan gambar dari CDN luar) — WA rich response ngeblokir
// load gambar dari domain luar (trusted_sources kosong), jadi emoji bawaan
// sistem yang paling reliable dijamin selalu muncul.
// icon: kalau diawali "http" dianggap link gambar (di-host sendiri di VPS),
// kalau bukan dianggap emoji biasa. Boleh dicampur sambil nyicil upload icon asli.
const SKILLS = [
  { name: 'Python', icon: 'ws://itclub.biz.id/icon/python', color: '#306998' },
  { name: 'JavaScript', icon: '🟨', color: '#f0db4f' },
  { name: 'HTML', icon: '🌐', color: '#e34c26' },
  { name: 'CSS', icon: '🎨', color: '#2965f1' },
  { name: 'Linux', icon: '🐧', color: '#fcc624' },
  { name: 'Node.js', icon: '🟢', color: '#5fa04e' }
]

// Social media — isi username/nomor kamu, kosongkan kalau nggak dipakai
const SOCIALS = [
  { platform: 'WhatsApp', handle: '+62 851-2634-0849', url: 'https://wa.me/6285126340849', icon: '💬', color: '#25D366' },
  { platform: 'GitHub', handle: 'username-github', url: 'https://github.com/username-github', icon: '🐙', color: '#333333' },
  { platform: 'Instagram', handle: '@username_ig', url: 'https://instagram.com/username_ig', icon: '📸', color: '#E4405F' },
  { platform: 'TikTok', handle: '@username_tiktok', url: 'https://tiktok.com/@username_tiktok', icon: '🎵', color: '#000000' }
]

// Lagu di bagian paling bawah (opsional — kosongkan SONG_URL kalau nggak mau ada player)
const SONG_URL = '' // link file mp3/mp4 audio, host sendiri di VPS
const SONG_COVER_URL = '' // cover kecil, ideal 200x200px
const SONG_TITLE = 'Nama Lagu'
const SONG_ARTIST = 'Nama Artis'

/* =========================================================
 * HELPER
 * ========================================================= */

function escapeHtml (value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/* =========================================================
 * HTML ABOUT CARD (fragment)
 * ========================================================= */

function createAboutCard () {
  const bannerStyle = BANNER_URL
    ? `background-image:url('${escapeHtml(BANNER_URL)}');background-size:cover;background-position:center;`
    : `background:linear-gradient(135deg,#3a0d0d,#0d0d12);`

  const avatarHtml = AVATAR_URL
    ? `<img class="avatar-img" src="${escapeHtml(AVATAR_URL)}">`
    : `<div class="avatar-fallback">${escapeHtml(NAME.charAt(0).toUpperCase())}</div>`

  let wsIconCounter = 0
  function renderIcon (icon) {
    if (typeof icon === 'string' && (icon.indexOf('wss://') === 0 || icon.indexOf('ws://') === 0)) {
      const iconId = 'wsicon-' + (wsIconCounter++)
      return '<span class="ws-icon" id="' + iconId + '" data-ws-icon="' + escapeHtml(icon) + '"></span>'
    }
    if (typeof icon === 'string' && icon.indexOf('http') === 0) {
      return '<img class="icon-img" src="' + escapeHtml(icon) + '">'
    }
    return icon
  }

  const skillsHtml = SKILLS.map(function (skill) {
    return (
      '<div class="skill-chip">' +
        '<span class="skill-icon">' + renderIcon(skill.icon) + '</span>' +
        '<span class="skill-label">' + escapeHtml(skill.name) + '</span>' +
      '</div>'
    )
  }).join('')

  const socialsHtml = SOCIALS.map(function (s) {
    return (
      '<a class="social-row" href="' + escapeHtml(s.url) + '">' +
        '<span class="social-left">' +
          '<span class="social-icon" style="background:' + escapeHtml(s.color) + '33;">' + renderIcon(s.icon) + '</span>' +
          '<span class="social-handle">' + escapeHtml(s.handle) + '</span>' +
        '</span>' +
        '<button class="copy-icon-btn" data-copy="' + escapeHtml(s.handle) + '" onclick="event.preventDefault();copyHandle(this)">⧉</button>' +
      '</a>'
    )
  }).join('')

  const songHtml = SONG_URL
    ? `
      <div class="song-player">
        ${SONG_COVER_URL ? `<img class="song-cover" src="${escapeHtml(SONG_COVER_URL)}">` : '<div class="song-cover song-cover-fallback">🎵</div>'}
        <div class="song-info">
          <div class="song-title">${escapeHtml(SONG_TITLE)}</div>
          <div class="song-artist">${escapeHtml(SONG_ARTIST)}</div>
        </div>
        <button class="song-play-btn" id="songPlayBtn">▶</button>
      </div>
      <audio id="songAudio" src="${escapeHtml(SONG_URL)}" preload="none"></audio>
    `
    : ''

  return `
    <style>
      * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
      html,body { background:#0a0a0c; color:#f2f2f2; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; min-height:100vh; }
      .wrap { min-height:100vh; padding:0 0 16px; max-width:420px; margin:0 auto; }
      .banner { position:relative; height:180px; ${bannerStyle} }
      .banner::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.1), rgba(10,10,12,1)); }
      .banner-tag { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.15); padding:5px 14px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.5px; z-index:2; }
      .avatar-wrap { display:flex; justify-content:center; margin-top:-56px; position:relative; z-index:3; }
      .avatar-ring { width:104px; height:104px; border-radius:50%; padding:4px; background:conic-gradient(from 0deg,#ff4d6d,#7b2ff7,#ff4d6d); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(0,0,0,.5); }
      .avatar-img { width:96px; height:96px; border-radius:50%; object-fit:cover; border:3px solid #0a0a0c; }
      .avatar-fallback { width:96px; height:96px; border-radius:50%; border:3px solid #0a0a0c; background:#1c1c22; display:flex; align-items:center; justify-content:center; font-size:34px; font-weight:800; }
      .name-row { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:12px; padding:0 16px; }
      .role-badge { background:linear-gradient(135deg,#ff4d6d,#7b2ff7); font-size:10.5px; font-weight:800; letter-spacing:.5px; padding:4px 12px; border-radius:20px; }
      .name-text { font-size:21px; font-weight:800; }
      .stats-row { display:flex; margin:16px 16px 0; background:#131316; border:1px solid #26262a; border-radius:14px; overflow:hidden; }
      .stat-box { flex:1; text-align:center; padding:14px 8px; }
      .stat-box + .stat-box { border-left:1px solid #26262a; }
      .stat-value { font-size:18px; font-weight:800; }
      .stat-label { font-size:10px; color:#8f8f95; letter-spacing:1px; margin-top:2px; }
      .street-sign { margin:16px 16px 0; text-align:center; background:linear-gradient(135deg,#b3151f,#7a0e15); border:2px solid #ffdd57; border-radius:8px; padding:10px; font-size:15px; font-weight:800; letter-spacing:1px; font-style:italic; }
      .subtitle-pill { margin:12px 16px 0; text-align:center; background:#131316; border:1px solid #26262a; border-radius:20px; padding:9px 12px; font-size:12px; color:#d5d5d5; }
      .skills-wrap { display:flex; flex-wrap:wrap; gap:8px; margin:16px 16px 0; justify-content:center; }
      .skill-chip { display:flex; flex-direction:column; align-items:center; gap:6px; background:#131316; border:1px solid #26262a; border-radius:14px; padding:14px 10px; font-size:10.5px; font-weight:600; width:74px; }
      .skill-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:28px; }
      .skill-label { color:#d5d5d5; }
      .icon-img { width:100%; height:100%; object-fit:contain; }
      .ws-icon { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
      .ws-icon svg { width:100%; height:100%; }
      .social-section { margin:18px 16px 0; background:#1a0a0c; border:1px solid #3a1418; border-radius:14px; overflow:hidden; }
      .social-section-title { font-size:12px; font-weight:800; letter-spacing:1.5px; color:#ff8080; padding:12px 14px 8px; }
      .social-row { display:flex; align-items:center; justify-content:space-between; padding:11px 14px; border-top:1px solid #2a1215; text-decoration:none; color:#f2f2f2; }
      .social-left { display:flex; align-items:center; gap:10px; }
      .social-icon { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
      .social-handle { font-size:13px; font-weight:600; }
      .copy-icon-btn { background:none; border:none; color:#999; font-size:14px; }
      .song-player { display:flex; align-items:center; gap:10px; margin:16px 16px 0; background:#131316; border:1px solid #26262a; border-radius:14px; padding:10px; }
      .song-cover { width:44px; height:44px; border-radius:8px; object-fit:cover; }
      .song-cover-fallback { display:flex; align-items:center; justify-content:center; background:#26262a; font-size:18px; }
      .song-info { flex:1; min-width:0; }
      .song-title { font-size:12.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .song-artist { font-size:11px; color:#8f8f95; margin-top:2px; }
      .song-play-btn { width:34px; height:34px; border-radius:50%; border:none; background:#4ade80; color:#0a0a0c; font-size:13px; flex-shrink:0; }
    </style>

    <div class="wrap">
      <div class="banner">
        <div class="banner-tag">${escapeHtml(ROLE_TAG)} 🧢</div>
      </div>

      <div class="avatar-wrap">
        <div class="avatar-ring">${avatarHtml}</div>
      </div>

      <div class="name-row">
        <span class="role-badge">OWNER</span>
        <span class="name-text">${escapeHtml(NAME)}</span>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-value">${escapeHtml(PROJECT_COUNT)}</div>
          <div class="stat-label">PROJECTS</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${escapeHtml(AGE)}</div>
          <div class="stat-label">UMUR</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${escapeHtml(EXPERIENCE)}</div>
          <div class="stat-label">PENGALAMAN</div>
        </div>
      </div>

      <div class="street-sign">${escapeHtml(STREET_SIGN)}</div>

      <div class="subtitle-pill">${escapeHtml(SUBTITLE)}</div>

      <div class="skills-wrap">
        ${skillsHtml}
      </div>

      <div class="social-section">
        <div class="social-section-title">SOSIAL MEDIA</div>
        ${socialsHtml}
      </div>

      ${songHtml}
    </div>

    <script>
      (function () {
        window.copyHandle = function (btn) {
          var text = btn.getAttribute('data-copy')
          function done () {
            var original = btn.textContent
            btn.textContent = '✓'
            setTimeout(function () { btn.textContent = original }, 1000)
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done) })
          } else {
            fallbackCopy(text, done)
          }
        }

        function fallbackCopy (text, cb) {
          var ta = document.createElement('textarea')
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          try { document.execCommand('copy') } catch (e) {}
          document.body.removeChild(ta)
          cb()
        }

        var playBtn = document.getElementById('songPlayBtn')
        var audio = document.getElementById('songAudio')
        if (playBtn && audio) {
          playBtn.addEventListener('click', function () {
            if (audio.paused) {
              audio.play()
              playBtn.textContent = '⏸'
            } else {
              audio.pause()
              playBtn.textContent = '▶'
            }
          })
          audio.addEventListener('ended', function () { playBtn.textContent = '▶' })
        }

        // DEBUG SEMENTARA — nunjukin status koneksi WS langsung di UI
        document.querySelectorAll('[data-ws-icon]').forEach(function (el) {
          var url = el.getAttribute('data-ws-icon')

          el.textContent = 'CONNECTING...'

          try {
            var ws = new WebSocket(url)

            ws.addEventListener('open', function () {
              el.textContent = 'WS OPEN'
            })

            ws.addEventListener('message', function (event) {
              el.textContent = 'WS RECEIVED'
              console.log('[ICON WS DATA]', event.data)
            })

            ws.addEventListener('error', function (e) {
              el.textContent = 'WS ERROR'
              console.error('[ICON WS ERROR]', url, e)
            })

            ws.addEventListener('close', function (event) {
              el.textContent = 'WS ' + event.code
              console.log('[ICON WS CLOSED]', {
                url: url,
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean
              })
            })

          } catch (e) {
            el.textContent = 'WS EXCEPTION'
            console.error('[ICON WS EXCEPTION]', e)
          }
        })
      })()
    </script>
  `
}

/* =========================================================
 * MESSAGE SENDER
 * ========================================================= */
async function sendRichHTML (conn, m, html, label) {
  const responseId = randomUUID()
  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {}, deviceListMetadataVersion: 2,
        botMetadata: { messageDisclaimerText: '', botResponseId: responseId }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1, submessages: [{ messageType: 2, messageText: label }],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: responseId,
                  sections: [{ view_model: { primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: html, trusted_sources: [] }, __typename: 'GenAISingleLayoutViewModel' } }]
                })
              ).toString('base64')
            },
            contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' }, forwardOrigin: 4 }
          }
        }
      }
    }, { messageId: responseId }
  )
}

/* =========================================================
 * HANDLER
 * ========================================================= */
let handler = async (m, { conn }) => {
  await m.react('🧢')
  try {
    const html = createAboutCard()
    console.log('[ABOUT] HTML size:', (Buffer.byteLength(html, 'utf8') / 1024).toFixed(2), 'KB')
    await sendRichHTML(conn, m, html, 'About Me')
    await m.react('✅')
  } catch (error) {
    console.error('[ABOUT ERROR]', error)
    await m.react('❌')
    await conn.sendMessage(m.chat, { text: '❌ Gagal menampilkan profil.\n\n' + `> ${error?.message || 'Unknown error'}` }, { quoted: m })
  }
}

handler.help = ['about']
handler.tags = ['general']
handler.command = /^about$/i
handler.limit = false

export default handler
