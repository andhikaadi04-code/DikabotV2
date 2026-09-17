import crypto from 'crypto'
import yts from 'yt-search'
import axios from 'axios'

const MAX_VIDEO_SIZE = 4 * 1024 * 1024
const MAX_DOWNLOAD_SIZE = 50 * 1024 * 1024

// =========================================================
// VPS VIDEO PROXY
// =========================================================

const PROXY_REGISTER_URL =
  'http://157.230.35.6:4000/register'

const PROXY_PUBLIC_URL =
  'http://157.230.35.6/video'

const PROXY_SECRET =
  process.env.PROXY_SECRET || 'DENZ-RAHASIA-2026'


// =========================================================
// HELPER
// =========================================================

function cleanApiKey(value) {
  if (!value) return ''

  return String(value)
    .trim()
    .replace(/^["']|["']$/g, '')
}


function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}


function formatDuration(seconds) {
  const sec = Number(seconds || 0)

  if (!sec || sec < 1) return 'Unknown'

  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return `${m}:${String(s).padStart(2, '0')}`
}


// =========================================================
// YOUTUBE SEARCH
// =========================================================

async function searchYouTube(query) {
  console.log(`[PLAYMV] Searching YouTube: ${query}`)

  const result = await yts(query)

  if (!result?.videos || !result.videos.length) {
    throw new Error('Video YouTube tidak ditemukan.')
  }

  const video = result.videos[0]

  if (!video?.url) {
    throw new Error('Hasil YouTube tidak memiliki URL.')
  }

  console.log(`[PLAYMV] Found: ${video.title}`)
  console.log(`[PLAYMV] URL: ${video.url}`)

  return video
}


// =========================================================
// ONIGI
// =========================================================

async function getOnigiVideo(youtubeUrl) {
  const apiKey = cleanApiKey(
    process.env.ONIGI_API_KEY
  )

  if (!apiKey) {
    throw new Error('ONIGI_API_KEY tidak terbaca.')
  }

  console.log('[ONIGI] Mengirim request...')

  try {
    const response = await axios.get(
      'https://api.onigi.biz.id/api/v1/download/youtube',
      {
        params: {
          url: youtubeUrl,
          type: 'mp4',
          apikey: apiKey
        },

        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },

        timeout: 60000
      }
    )

    console.log('[ONIGI] HTTP:', response.status)
    console.log('[ONIGI] Status:', response.data?.status)

    const data = response.data

    if (!data?.status) {
      throw new Error(
        data?.message ||
        data?.error ||
        'ONIGI gagal memproses video.'
      )
    }

    const result = data.result || {}

    const videoUrl =
      result.directUrl ||
      result.downloadUrl ||
      result.download ||
      result.videoUrl ||
      result.url

    if (!videoUrl) {
      console.log(
        '[ONIGI RESPONSE]',
        JSON.stringify(data).slice(0, 3000)
      )

      throw new Error(
        'ONIGI berhasil merespons tetapi tidak memberikan URL video.'
      )
    }

    console.log(
      '[ONIGI] URL video berhasil didapat.'
    )

    return {
      videoUrl,

      title:
        result.title ||
        'YouTube Video',

      thumbnail:
        result.image ||
        result.thumbnail ||
        '',

      format:
        result.format ||
        '720',

      duration:
        result.duration ||
        0,

      uploader:
        result.uploader ||
        result.author ||
        'YouTube',

      views:
        result.viewCount ||
        result.views ||
        0
    }

  } catch (error) {

    if (error.response) {
      console.log(
        '[ONIGI ERROR HTTP]',
        error.response.status
      )

      console.log(
        '[ONIGI ERROR DATA]',
        JSON.stringify(error.response.data)
      )

      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `ONIGI HTTP ${error.response.status}`
      )
    }

    throw new Error(
      `Gagal menghubungi ONIGI: ${error.message}`
    )
  }
}


// =========================================================
// REGISTER VIDEO KE VPS PROXY
// =========================================================

async function registerVideoProxy(videoUrl) {

  console.log('[PROXY] Registering video...')

  try {

    const response = await axios.post(
      PROXY_REGISTER_URL,

      {
        url: videoUrl
      },

      {
        headers: {
          'Content-Type': 'application/json',
          'x-proxy-secret': PROXY_SECRET
        },

        timeout: 15000
      }
    )

    const data = response.data

    if (!data?.success || !data?.id) {

      throw new Error(
        data?.message ||
        'Proxy gagal membuat video ID.'
      )
    }

    const id = data.id

    const publicUrl =
      `${PROXY_PUBLIC_URL}/${id}`

    console.log(
      '[PROXY] Video registered.'
    )

    console.log(
      `[PROXY] ID: ${id}`
    )

    console.log(
      `[PROXY] Public URL: ${publicUrl}`
    )

    return publicUrl

  } catch (error) {

    console.error(
      '[PROXY ERROR]',
      error.response?.data ||
      error.message
    )

    throw new Error(
      'Gagal mendaftarkan video ke VPS proxy.'
    )
  }
}


// =========================================================
// OPTIONAL DOWNLOAD CHECK
// =========================================================
// Tidak dipakai untuk Rich Video.
// Dibiarkan sebagai helper kalau nanti diperlukan.

async function videoToDataUri(videoUrl) {

  console.log(
    '[PLAYMV] Downloading video for Data URI...'
  )

  try {

    const response = await axios.get(
      videoUrl,

      {
        responseType: 'arraybuffer',

        maxContentLength:
          MAX_DOWNLOAD_SIZE,

        maxBodyLength:
          MAX_DOWNLOAD_SIZE,

        timeout: 60000,

        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    const buffer =
      Buffer.from(response.data)

    if (buffer.length > MAX_VIDEO_SIZE) {
      throw new Error(
        `Video terlalu besar: ` +
        `${(buffer.length / 1024 / 1024).toFixed(2)} MB`
      )
    }

    const contentType =
      response.headers['content-type'] ||
      'video/mp4'

    const base64 =
      buffer.toString('base64')

    return `data:${contentType};base64,${base64}`

  } catch (error) {

    console.error(
      '[DATA URI ERROR]',
      error.message
    )

    throw error
  }
}


// =========================================================
// BUILD VIDEO HTML
// =========================================================

function buildVideoHtml(video) {

  const videoUrl =
    escapeHtml(video.videoUrl)

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>
${escapeHtml(video.title)}
</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#000;
  "
>

<video
  controls
  playsinline
  preload="metadata"
  style="
    width:100%;
    max-height:400px;
    background:#000;
  "
  src="${videoUrl}"
></video>

</body>

</html>
`
}


// =========================================================
// SEND RICH VIDEO
// =========================================================

async function sendRichVideo(
  conn,
  chat,
  html
) {
  const responseId = crypto.randomUUID()

  const unifiedResponse = {
    response_id: responseId,
    sections: [
      {
        view_model: {
          primitive: {
            __typename: 'GenAIaeacdsnwHtmlPrimitive',
            payload: html,
            trusted_sources: []
          },
          __typename: 'GenAISingleLayoutViewModel'
        }
      }
    ]
  }

  const base64Data = Buffer
    .from(JSON.stringify(unifiedResponse), 'utf8')
    .toString('base64')

  console.log(
    `[PLAYMV] Rich payload: ${(base64Data.length / 1024).toFixed(2)} KB`
  )

  await conn.relayMessage(
    chat,
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
                messageText: 'Video Player'
              }
            ],
            unifiedResponse: {
              data: base64Data
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: '867051314767696@bot'
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

  console.log('[PLAYMV] Rich Response terkirim.')
}

// =========================================================
// MAIN HANDLER
// =========================================================

const playmvHandler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

   const chat = m.chat
const query = text

  try {

    if (!query || !query.trim()) {

      if (m?.react) {
        await m.react('❌')
      }

      return conn.sendMessage(
        chat,
        {
          text:
            'Contoh penggunaan:\n.playmv nama video'
        }
      )
    }

    const searchQuery = query.trim()

    console.log(
      `[PLAYMV] Query: ${query}`
    )

    if (m?.react) {
      await m.react('🔎')
    }

    // -----------------------------------------------------
    // 1. SEARCH YOUTUBE
    // -----------------------------------------------------

    const youtubeVideo =
      await searchYouTube(query)

    // -----------------------------------------------------
// 2. DOWNLOAD LANGSUNG VIA VPS (yt-dlp)
// -----------------------------------------------------

const ytResult = await axios.post(
  'http://157.230.35.6:4000/fetch-youtube',
  { url: youtubeVideo.url },
  {
    headers: {
      'Content-Type': 'application/json',
      'x-proxy-secret': PROXY_SECRET
    },
    timeout: 180000
  }
).catch((error) => {
  throw new Error(
    error.response?.data?.message ||
    'Gagal download video via VPS: ' + error.message
  )
})

const ytData = ytResult.data

if (!ytData?.success || !ytData?.id) {
  throw new Error(ytData?.message || 'VPS gagal memproses video.')
}

const video = {
  title: ytData.title,
  thumbnail: ytData.thumbnail,
  duration: ytData.duration,
  uploader: ytData.uploader,
  views: ytData.views,
  videoUrl: `${PROXY_PUBLIC_URL}/${ytData.id}`
}

console.log('[PLAYMV] Video via yt-dlp VPS')
console.log(`[PLAYMV] Proxy URL: ${video.videoUrl}`)

    console.log(
      '[PLAYMV] Stream source: VPS PROXY'
    )

    console.log(
      `[PLAYMV] Proxy URL: ${video.videoUrl}`
    )

    console.log(
      `[PLAYMV] Video: ${video.title}`
    )

    console.log(
      `[PLAYMV] Format: ${video.format}`
    )

    console.log(
      `[PLAYMV] Duration: ${formatDuration(video.duration)}`
    )

    // -----------------------------------------------------
    // 5. BUILD HTML
    // -----------------------------------------------------

    const html =
      buildVideoHtml(video)

    console.log(
      `[PLAYMV] HTML size: ${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(2)} KB`
    )

    // -----------------------------------------------------
    // 6. SEND RICH VIDEO
    // -----------------------------------------------------

    await sendRichVideo(
      conn,
      chat,
      html
    )

    if (m?.react) {
      await m.react('✅')
    }

    console.log(
      `[PLAYMV] Sent: ${video.title}`
    )

  } catch (error) {

    console.error(
      '[PLAYMV ERROR]',
      error
    )

    if (m?.react) {
      await m.react('❌')
    }

    try {

      await conn.sendMessage(
        chat,

        {
          text:
            `❌ Gagal memutar video.\n\n` +
            `${error.message}`
        }
      )

    } catch (sendError) {

      console.error(
        '[PLAYMV SEND ERROR]',
        sendError.message
      )
    }
      }

}
playmvHandler.command = /^playmv$/i
export default playmvHandler
