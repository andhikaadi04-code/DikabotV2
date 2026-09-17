'use strict'

import { randomUUID } from 'crypto'

/* =========================================================
 * KONFIGURASI — EDIT DI SINI
 * ========================================================= */

const BOT_NAME = 'XPPLG 1 BOT'
const BOT_VERSION = 'V2.0.0'
const BRAND_TAG = 'ᴅᴇᴠᴇʟᴏᴘᴇʀ © ᴅᴇɴʀᴀ sᴀᴘᴜᴛʀᴀ'

// Isi salah satu (video diprioritaskan kalau dua-duanya keisi).
const HERO_IMAGE_URL = ''
const HERO_VIDEO_URL = 'wss://itclub.biz.id/video/hero/socket'

const MENU_DATA = [
  {
    category: 'SCHOOL',
    items: [
      { cmd: '.mapel', desc: 'Lihat daftar mata pelajaran' },
      { cmd: '.jadwal', desc: 'Lihat jadwal pelajaran' },
      { cmd: '.tugas', desc: 'Lihat/kelola daftar tugas' },
      { cmd: '.addgc', desc: 'Tambah grup ke daftar' },
      { cmd: '.delgc', desc: 'Hapus grup dari daftar' },
      { cmd: '.listgc', desc: 'Lihat daftar grup' },
      { cmd: '.p', desc: 'Perintah cepat' },
      { cmd: '.pg', desc: 'Perintah cepat' }
    ]
  },
  {
    category: 'KELAS',
    items: [
      { cmd: '.struktur', desc: 'Lihat struktur kelas' },
      { cmd: '.piket', desc: 'Lihat jadwal piket' },
      { cmd: '.seragam', desc: 'Lihat jadwal seragam' },
      { cmd: '.eskul', desc: 'Lihat daftar ekstrakurikuler' },
      { cmd: '.count', desc: 'Hitung jumlah anggota' },
      { cmd: '.siswa', desc: 'Lihat daftar siswa' }
    ]
  },
  {
    category: 'TOOLS',
    items: [
      { cmd: '.s', desc: 'Buat stiker dari media yang di-reply' },
      { cmd: '.brat', desc: 'Buat stiker brat style' },
      { cmd: '.tt', desc: 'Download video TikTok' },
      { cmd: '.gbtech', desc: 'Grup Eksplor Teknologi' }
    ]
  },
  {
    category: 'GAMES',
    items: [
      { cmd: '.snake', desc: 'Main ular klasik' }
    ]
  },
  {
    category: 'MUSIC',
    items: [
      { cmd: '.play2', desc: 'Putar audio dari YouTube' },
      { cmd: '.playlirik', desc: 'Putar audio dengan lirik sinkron' }
    ]
  },
  {
    category: 'SYSTEM',
    items: [
      { cmd: '.ping', desc: 'Cek kecepatan respon bot' },
      { cmd: '.dev', desc: 'Info developer bot' }
    ]
  },
  {
    category: 'COMMUNITY',
    items: [
      { cmd: '.gbtech', desc: 'Grup Eksplor Teknologi' }
    ]
  }
]

/* =========================================================
 * HELPER
 * ========================================================= */

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/* =========================================================
 * HTML MENU
 * ========================================================= */

function createJarvisMenu() {
  const sectionsHtml = MENU_DATA.map(function (group, groupIndex) {
    const itemsHtml = group.items.map(function (item) {
      return (
        '<div class="cmd-row" data-search="' +
        escapeHtml((item.cmd + ' ' + item.desc).toLowerCase()) +
        '">' +
          '<div class="cmd-info">' +
            '<div class="cmd-name">' +
              escapeHtml(item.cmd) +
            '</div>' +
            '<div class="cmd-desc">' +
              escapeHtml(item.desc) +
            '</div>' +
          '</div>' +
          '<button class="copy-btn" data-copy="' +
            escapeHtml(item.cmd) +
          '">COPY</button>' +
        '</div>'
      )
    }).join('')

    return (
      '<div class="category" data-cat-index="' + groupIndex + '">' +
        '<div class="category-header" data-toggle="' + groupIndex + '">' +
          '<div class="category-title">' +
            '<span class="dot"></span>' +
            escapeHtml(group.category) +
          '</div>' +
          '<div class="category-right">' +
            '<span class="badge">' +
              group.items.length +
            '</span>' +
            '<span class="chevron" id="chevron-' +
              groupIndex +
            '">&#9650;</span>' +
          '</div>' +
        '</div>' +
        '<div class="category-body" id="body-' +
          groupIndex +
        '">' +
          itemsHtml +
        '</div>' +
      '</div>'
    )
  }).join('')

  const heroMediaHtml = HERO_VIDEO_URL
    ? '<video class="hero-media" id="heroVideo" autoplay muted playsinline></video>'
    : HERO_IMAGE_URL
      ? '<img class="hero-media" src="' +
        escapeHtml(HERO_IMAGE_URL) +
        '">'
      : ''

  const mediaControlsHtml = HERO_VIDEO_URL
    ? '<div class="media-controls">' +
        '<button class="mute-btn" id="muteBtn">' +
          '🔇 Suara Mati' +
        '</button>' +
      '</div>'
    : ''

  return `
    <style>
      :root {
        --ink:#1c1c1e;
        --muted:#6b6b70;
        --accent:#22c55e;
        --line:#e5e5ea;
        --card:#ffffff;
        --bg:#f4f4f6;
        --sys:-apple-system,BlinkMacSystemFont,'Segoe UI',
          Roboto,Helvetica,Arial,sans-serif;
      }

      * {
        margin:0;
        padding:0;
        box-sizing:border-box;
        -webkit-tap-highlight-color:transparent;
      }

      html,body {
        background:var(--bg);
        color:var(--ink);
        font-family:var(--sys);
        min-height:100vh;
      }

      .wrap {
        min-height:100vh;
        padding:12px;
      }

      .hero {
        position:relative;
        border-radius:16px;
        overflow:hidden;
        padding:22px 18px;
        margin-bottom:10px;
        aspect-ratio:16 / 9;
        min-height:0;
        background:#111;
        border:1px solid var(--line);
      }

      .hero-media {
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        object-fit:contain;
        z-index:0;
      }

      .hero::after {
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(
          180deg,
          rgba(0,0,0,.05),
          rgba(0,0,0,.45)
        );
        z-index:1;
        pointer-events:none;
      }

      .hero-title,
      .hero-sub,
      .hero-badge {
        position:relative;
        z-index:2;
      }

      .hero-title {
        font-size:21px;
        font-weight:800;
        letter-spacing:.3px;
        color:#111;
      }

      .hero-sub {
        font-size:11px;
        color:#555;
        letter-spacing:2px;
        margin-top:2px;
      }

      .hero-badge {
        position:absolute;
        top:16px;
        right:14px;
        z-index:2;
        border:1px solid #d5d5da;
        border-radius:20px;
        padding:4px 12px;
        font-size:11px;
        font-weight:700;
        background:rgba(255,255,255,.85);
        color:#333;
      }

      .media-controls {
        display:flex;
        justify-content:flex-end;
        margin-bottom:14px;
      }

      .mute-btn {
        border:1px solid var(--line);
        background:var(--card);
        color:var(--ink);
        font-size:11px;
        font-weight:700;
        padding:7px 14px;
        border-radius:20px;
        cursor:pointer;
        position:relative;
        z-index:10;
      }

      .search-box {
        width:100%;
        padding:12px 14px;
        border-radius:12px;
        border:1px solid var(--line);
        background:var(--card);
        color:var(--ink);
        font-size:14px;
        margin-bottom:14px;
        outline:none;
      }

      .search-box::placeholder {
        color:#a1a1a6;
      }

      .category {
        border:1px solid var(--line);
        border-radius:14px;
        margin-bottom:10px;
        overflow:hidden;
        background:var(--card);
      }

      .category-header {
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:14px 16px;
        cursor:pointer;
      }

      .category-title {
        font-size:12.5px;
        font-weight:800;
        letter-spacing:1.5px;
        color:#333;
        display:flex;
        align-items:center;
      }

      .dot {
        width:6px;
        height:6px;
        border-radius:50%;
        background:var(--accent);
        margin-right:8px;
        display:inline-block;
      }

      .category-right {
        display:flex;
        align-items:center;
        gap:8px;
      }

      .badge {
        background:#eef0f2;
        color:#555;
        font-size:11px;
        font-weight:700;
        padding:2px 8px;
        border-radius:10px;
      }

      .chevron {
        font-size:10px;
        color:#999;
        transition:transform .2s ease;
      }

      .chevron.collapsed {
        transform:rotate(180deg);
      }

      .category-body {
        border-top:1px solid var(--line);
        max-height:2000px;
        overflow:hidden;
        transition:max-height .25s ease;
      }

      .category-body.collapsed {
        max-height:0;
        border-top:none;
      }

      .cmd-row {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        padding:14px 16px;
        border-bottom:1px solid #f0f0f2;
      }

      .cmd-row:last-child {
        border-bottom:none;
      }

      .cmd-name {
        font-family:'SF Mono',Consolas,monospace;
        font-size:13.5px;
        font-weight:700;
        color:#111;
      }

      .cmd-desc {
        font-size:11.5px;
        color:var(--muted);
        margin-top:3px;
        line-height:1.4;
      }

      .copy-btn {
        flex-shrink:0;
        background:transparent;
        border:1px solid #d5d5da;
        color:#333;
        font-size:10.5px;
        font-weight:800;
        letter-spacing:.5px;
        padding:7px 12px;
        border-radius:8px;
        cursor:pointer;
      }

      .copy-btn.copied {
        background:var(--accent);
        border-color:var(--accent);
        color:#fff;
      }

      .footer {
        text-align:center;
        font-size:10px;
        letter-spacing:1px;
        color:#a1a1a6;
        padding:16px 0 6px;
      }

      .cmd-row.hidden,
      .category.hidden {
        display:none;
      }
    </style>

    <div class="wrap">

      <div class="hero">
        ${heroMediaHtml}

        <div class="hero-badge">
          ${escapeHtml(BOT_VERSION)}
        </div>

        <div class="hero-title">
          ${escapeHtml(BOT_NAME)}
        </div>

        <div class="hero-sub">
          COMMAND HUB
        </div>
      </div>

      ${mediaControlsHtml}

      <input
        class="search-box"
        id="searchBox"
        placeholder="Cari perintah..."
      >

      <div id="menuContainer">
        ${sectionsHtml}
      </div>

      <div class="footer">
        ${escapeHtml(BRAND_TAG)}
      </div>

    </div>

    <script>
      (function () {

        /* ================================
         * CATEGORY
         * ================================ */

        document
          .querySelectorAll('.category-header')
          .forEach(function (header) {

            header.addEventListener('click', function () {

              var index =
                header.getAttribute('data-toggle')

              var body =
                document.getElementById('body-' + index)

              var chev =
                document.getElementById(
                  'chevron-' + index
                )

              if (!body || !chev) return

              body.classList.toggle('collapsed')
              chev.classList.toggle('collapsed')

            })
          })


        /* ================================
         * SEARCH
         * ================================ */

        var searchBox =
          document.getElementById('searchBox')

        if (searchBox) {

          searchBox.addEventListener(
            'input',
            function () {

              var q =
                searchBox.value
                  .trim()
                  .toLowerCase()

              document
                .querySelectorAll('.category')
                .forEach(function (cat) {

                  var rows =
                    cat.querySelectorAll('.cmd-row')

                  var visibleCount = 0

                  rows.forEach(function (row) {

                    var data =
                      row.getAttribute('data-search') || ''

                    var match =
                      data.indexOf(q) !== -1

                    row.classList.toggle(
                      'hidden',
                      !match
                    )

                    if (match) {
                      visibleCount++
                    }

                  })

                  cat.classList.toggle(
                    'hidden',
                    visibleCount === 0
                  )

                })
            }
          )

        }


        /* ================================
         * COPY BUTTON
         * ================================ */

        document
          .querySelectorAll('.copy-btn')
          .forEach(function (btn) {

            btn.addEventListener(
              'click',
              function () {

                var text =
                  btn.getAttribute('data-copy')

                function done() {

                  btn.classList.add('copied')
                  btn.textContent = 'COPIED'

                  setTimeout(
                    function () {

                      btn.classList.remove('copied')
                      btn.textContent = 'COPY'

                    },
                    1200
                  )
                }

                function fallbackCopy(
                  text,
                  cb
                ) {

                  var ta =
                    document.createElement('textarea')

                  ta.value = text

                  document.body.appendChild(ta)

                  ta.select()

                  try {
                    document.execCommand('copy')
                  } catch (e) {}

                  document.body.removeChild(ta)

                  cb()
                }

                if (
                  navigator.clipboard &&
                  navigator.clipboard.writeText
                ) {

                  navigator.clipboard
                    .writeText(text)
                    .then(done)
                    .catch(function () {
                      fallbackCopy(text, done)
                    })

                } else {

                  fallbackCopy(text, done)

                }

              }
            )

          })


        /* ================================
         * WEBSOCKET VIDEO PLAYER
         * ================================ */

        var video =
          document.getElementById('heroVideo')

        if (
          video &&
          '${escapeHtml(HERO_VIDEO_URL)}'
        ) {

          var VIDEO_WS_URL =
            '${escapeHtml(HERO_VIDEO_URL)}'

          var reconnecting = false
          var destroyed = false


          function startVideoStream() {

            if (
              reconnecting ||
              destroyed
            ) {
              return
            }

            reconnecting = true

            console.log(
              '[ECHI VIDEO] Memulai stream...'
            )


            var mediaSource =
              new MediaSource()

            var objectUrl =
              URL.createObjectURL(
                mediaSource
              )


            video.pause()

            video.removeAttribute('src')

            video.load()

            video.src = objectUrl


            mediaSource.addEventListener(
              'sourceopen',
              function () {

                if (destroyed) {
                  return
                }


                var mime =
                  'video/mp4; codecs="avc1.42E01E,mp4a.40.2"'


                if (
                  !MediaSource.isTypeSupported(
                    mime
                  )
                ) {

                  console.error(
                    '[ECHI VIDEO] MIME tidak didukung:',
                    mime
                  )

                  reconnecting = false

                  return
                }


                var sourceBuffer =
                  mediaSource.addSourceBuffer(
                    mime
                  )

                var queue = []

                var updating = false

                var streamFinished = false

                var restarted = false


                function appendNext() {

                  if (
                    sourceBuffer.updating ||
                    updating ||
                    queue.length === 0
                  ) {
                    return
                  }

                  updating = true

                  try {

                    var data =
                      queue.shift()

                    sourceBuffer.appendBuffer(
                      data
                    )

                  } catch (err) {

                    console.error(
                      '[ECHI VIDEO] appendBuffer error:',
                      err
                    )

                    updating = false

                    setTimeout(
                      appendNext,
                      100
                    )

                  }
                }


                function finishStream() {

                  if (!streamFinished) {
                    return
                  }

                  if (
                    queue.length === 0 &&
                    !sourceBuffer.updating &&
                    !updating &&
                    mediaSource.readyState === 'open'
                  ) {

                    try {

                      mediaSource.endOfStream()

                      console.log(
                        '[ECHI VIDEO] Stream selesai, menunggu video ended...'
                      )

                    } catch (e) {

                      console.error(
                        '[ECHI VIDEO] endOfStream error:',
                        e
                      )

                    }
                  }
                }


                sourceBuffer.addEventListener(
                  'updateend',
                  function () {

                    updating = false

                    appendNext()

                    finishStream()

                    if (
                      video.paused &&
                      !streamFinished
                    ) {

                      video
                        .play()
                        .catch(function () {})

                    }

                  }
                )


                var ws =
                  new WebSocket(
                    VIDEO_WS_URL
                  )

                ws.binaryType =
                  'arraybuffer'


                ws.addEventListener(
                  'open',
                  function () {

                    console.log(
                      '[ECHI VIDEO] WebSocket connected'
                    )

                    reconnecting = false


                    ws.send(
                      JSON.stringify({
                        type: 'stream_request',
                        videoId: 'hero',
                        title: 'XPPLG 1 BOT'
                      })
                    )


                    video
                      .play()
                      .catch(function () {})

                  }
                )


                ws.addEventListener(
                  'message',
                  function (event) {

                    /* =========================
                     * TEXT MESSAGE
                     * ========================= */

                    if (
                      typeof event.data === 'string'
                    ) {

                      console.log(
                        '[ECHI VIDEO]',
                        event.data
                      )


                      try {

                        var msg =
                          JSON.parse(
                            event.data
                          )


                        if (
                          msg.type === 'stream_end' ||
                          msg.type === 'end'
                        ) {

                          console.log(
                            '[ECHI VIDEO] Server selesai mengirim video'
                          )

                          streamFinished = true

                          finishStream()

                        }

                      } catch (e) {}

                      return
                    }


                    /* =========================
                     * VIDEO CHUNK
                     * ========================= */

                    try {

                      var data =
                        new Uint8Array(
                          event.data
                        )

                      queue.push(data)

                      appendNext()


                      if (video.paused) {

                        video
                          .play()
                          .catch(function () {})

                      }

                    } catch (err) {

                      console.error(
                        '[ECHI VIDEO] Chunk error:',
                        err
                      )

                    }

                  }
                )


                ws.addEventListener(
                  'error',
                  function (err) {

                    console.error(
                      '[ECHI VIDEO] WebSocket error:',
                      err
                    )

                  }
                )


                ws.addEventListener(
                  'close',
                  function () {

                    console.log(
                      '[ECHI VIDEO] WebSocket closed'
                    )

                    streamFinished = true

                    finishStream()

                  }
                )


                /* =========================
                 * RESTART VIDEO
                 * ========================= */

                function restartVideo() {

                  if (
                    restarted ||
                    destroyed
                  ) {
                    return
                  }

                  restarted = true

                  console.log(
                    '[ECHI VIDEO] Video selesai, mengulang...'
                  )


                  try {

                    if (
                      ws.readyState ===
                        WebSocket.OPEN ||
                      ws.readyState ===
                        WebSocket.CONNECTING
                    ) {

                      ws.close()

                    }

                  } catch (e) {}


                  try {

                    if (
                      mediaSource.readyState ===
                      'open'
                    ) {

                      mediaSource.endOfStream()

                    }

                  } catch (e) {}


                  try {

                    URL.revokeObjectURL(
                      objectUrl
                    )

                  } catch (e) {}


                  reconnecting = false


                  setTimeout(
                    function () {

                      startVideoStream()

                    },
                    50
                  )

                }


                video.addEventListener(
                  'ended',
                  restartVideo,
                  {
                    once: true
                  }
                )


                video.addEventListener(
                  'error',
                  function () {

                    console.error(
                      '[ECHI VIDEO] Video element error'
                    )

                  },
                  {
                    once: true
                  }
                )

              }
            )
          }


          startVideoStream()

        }


        /* ================================
         * MUTE BUTTON
         * ================================ */

        var muteBtn =
          document.getElementById('muteBtn')


        if (muteBtn) {

          muteBtn.addEventListener(
            'click',
            function () {

              var heroVideo =
                document.getElementById(
                  'heroVideo'
                )

              if (!heroVideo) {
                return
              }


              heroVideo.muted =
                !heroVideo.muted


              muteBtn.textContent =
                heroVideo.muted
                  ? '🔇 Suara Mati'
                  : '🔊 Suara Nyala'

            }
          )

        }

      })()
    </script>
  `
}


/* =========================================================
 * MESSAGE SENDER
 * ========================================================= */

async function sendRichHTML(
  conn,
  m,
  html,
  label
) {

  const responseId =
    randomUUID()


  await conn.relayMessage(
    m.chat,
    {

      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,

        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: responseId
        }
      },


      botForwardedMessage: {

        message: {

          richResponseMessage: {

            messageType: 1,

            submessages: [
              {
                messageType: 2,
                messageText: label
              }
            ],


            unifiedResponse: {

              data: Buffer.from(
                JSON.stringify({

                  response_id:
                    responseId,

                  sections: [
                    {
                      view_model: {

                        primitive: {

                          __typename:
                            'GenAIaeacdsnwHtmlPrimitive',

                          payload:
                            html,

                          trusted_sources: []

                        },

                        __typename:
                          'GenAISingleLayoutViewModel'

                      }
                    }
                  ]

                })
              ).toString('base64')

            },


            contextInfo: {

              forwardingScore: 1,

              isForwarded: true,

              forwardedAiBotMessageInfo: {
                botJid:
                  '867051314767696@bot'
              },

              forwardOrigin: 4

            }

          }

        }

      }

    },
    {
      messageId: responseId
    }
  )
}


/* =========================================================
 * HANDLER
 * ========================================================= */

let handler = async (
  m,
  { conn }
) => {

  console.log(
    '[JARVIS] COMMAND MASUK:',
    m.chat,
    m.text
  )


  await m.react('🤖')


  try {

    const html =
      createJarvisMenu()


    console.log(
      '[JARVIS] HTML size:',
      (
        Buffer.byteLength(
          html,
          'utf8'
        ) / 1024
      ).toFixed(2),
      'KB'
    )


    await sendRichHTML(
      conn,
      m,
      html,
      'Command Hub'
    )


    await m.react('✅')

  } catch (error) {

    console.error(
      '[JARVIS ERROR]',
      error
    )


    await m.react('❌')


    await conn.sendMessage(
      m.chat,
      {
        text:
          '❌ Gagal membuka menu.\n\n' +
          `> ${error?.message || 'Unknown error'}`
      },
      {
        quoted: m
      }
    )

  }

}


handler.help = ['echi']
handler.tags = ['general']
handler.command = /^echi$/i
handler.limit = false

export default handler