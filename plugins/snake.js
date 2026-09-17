'use strict'

import { randomUUID } from 'crypto'

/* =========================================================
 * HTML GAME (canvas + JS, semua jalan di sisi client/WA)
 * ========================================================= */
function createSnakeGame() {
  return `
    <style>
      :root { --ink:#ffffff; --muted:#b9b1b6; --accent:#5fd068; --sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
      * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none; }
      html,body { background:transparent; color:var(--ink); font-family:var(--sys); min-height:100vh; }
      .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px 12px; }
      .card { position:relative; width:100%; max-width:320px; border-radius:18px; overflow:hidden; background:#0d1710; box-shadow:0 18px 40px rgba(0,0,0,.5); padding:16px; }
      .head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
      .head__title { font-size:14px; font-weight:700; letter-spacing:.04em; }
      .head__score { font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; }
      .head__score b { color:var(--accent); }
      canvas { width:100%; aspect-ratio:1; border-radius:10px; background:#132018; display:block; }
      .pad { display:grid; grid-template-columns:56px 56px 56px; grid-template-rows:44px 44px; justify-content:center; gap:6px; margin-top:14px; }
      .btn { display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.07); border:none; border-radius:10px; color:var(--ink); font-size:18px; cursor:pointer; }
      .btn:active { background:rgba(255,255,255,.18); }
      .btn.up { grid-column:2; grid-row:1; }
      .btn.left { grid-column:1; grid-row:2; }
      .btn.down { grid-column:2; grid-row:2; }
      .btn.right { grid-column:3; grid-row:2; }
      .over { position:absolute; inset:0; z-index:5; background:rgba(8,14,10,.92); display:none; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; }
      .over.show { display:flex; }
      .over__title { font-size:18px; font-weight:700; margin-bottom:6px; }
      .over__score { font-size:13px; color:var(--muted); margin-bottom:16px; }
      .over__btn { background:var(--accent); color:#0d1710; border:none; padding:10px 22px; border-radius:24px; font-weight:700; font-size:13px; cursor:pointer; }
    </style>

    <div class="wrap">
      <div class="card">
        <div class="head">
          <div class="head__title">🐍 Snake</div>
          <div class="head__score">Skor: <b id="score">0</b></div>
        </div>
        <canvas id="board" width="280" height="280"></canvas>
        <div class="pad">
          <button class="btn up" data-dir="up">⬆️</button>
          <button class="btn left" data-dir="left">⬅️</button>
          <button class="btn down" data-dir="down">⬇️</button>
          <button class="btn right" data-dir="right">➡️</button>
        </div>

        <div class="over" id="over">
          <div class="over__title">Game Over</div>
          <div class="over__score" id="overScore">Skor akhir: 0</div>
          <button class="over__btn" id="restart">Main Lagi</button>
        </div>
      </div>
    </div>

    <script>
      (function () {
        var canvas = document.getElementById('board')
        var ctx = canvas.getContext('2d')
        var GRID = 14
        var cell = canvas.width / GRID
        var scoreEl = document.getElementById('score')
        var overEl = document.getElementById('over')
        var overScoreEl = document.getElementById('overScore')

        var snake, dir, nextDir, food, score, alive, loopId

        function randCell () {
          return { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
        }

        function placeFood () {
          if (snake.length >= GRID * GRID) return // grid penuh
          var p
          do { p = randCell() } while (snake.some(function (s) { return s.x === p.x && s.y === p.y }))
          food = p
        }

        function reset () {
          snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }]
          dir = 'right'; nextDir = 'right'
          score = 0
          alive = true
          scoreEl.textContent = score
          overEl.classList.remove('show')
          placeFood()
          if (loopId) clearInterval(loopId)
          loopId = setInterval(tick, 160)
          draw()
        }

        function tick () {
          if (!alive) return
          dir = nextDir
          var head = { x: snake[0].x, y: snake[0].y }
          if (dir === 'up') head.y -= 1
          if (dir === 'down') head.y += 1
          if (dir === 'left') head.x -= 1
          if (dir === 'right') head.x += 1

          var hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID
          var hitSelf = snake.some(function (s) { return s.x === head.x && s.y === head.y })

          if (hitWall || hitSelf) {
            alive = false
            clearInterval(loopId)
            overScoreEl.textContent = 'Skor akhir: ' + score
            overEl.classList.add('show')
            return
          }

          snake.unshift(head)
          if (head.x === food.x && head.y === food.y) {
            score += 1
            scoreEl.textContent = score
            placeFood()
          } else {
            snake.pop()
          }
          draw()
        }

        function draw () {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#e2543f'
          ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4)

          snake.forEach(function (s, i) {
            ctx.fillStyle = i === 0 ? '#8be894' : '#5fd068'
            ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2)
          })
        }

        function setDir (d) {
          var opposite = { up: 'down', down: 'up', left: 'right', right: 'left' }
          if (opposite[d] === dir) return
          nextDir = d
        }

        document.querySelectorAll('.btn').forEach(function (btn) {
          btn.addEventListener('click', function () { setDir(btn.dataset.dir) })
        })
        document.getElementById('restart').addEventListener('click', reset)

        reset()
      })()
    </script>
  `
}

/* =========================================================
 * MESSAGE SENDER (sama kayak sendMusicPlayer di play.js)
 * ========================================================= */
async function sendRichHTML(conn, m, html, label) {
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
  await m.react('🐍')
  try {
    const html = createSnakeGame()
    await sendRichHTML(conn, m, html, 'Snake Game')
    await m.react('✅')
  } catch (error) {
    console.error('[SNAKE ERROR]', error)
    await m.react('❌')
    await conn.sendMessage(m.chat, { text: '❌ Gagal membuka game.\n\n' + `> ${error?.message || 'Unknown error'}` }, { quoted: m })
  }
}

handler.help = ['snake']
handler.tags = ['game']
handler.command = /^snake$/i
handler.limit = false

export default handler
