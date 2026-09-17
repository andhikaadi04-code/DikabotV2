import { readFile } from 'node:fs/promises'
const asset = name => readFile(new URL(`./assets/${name}`, import.meta.url), 'utf8')
export async function buildPlayerHtml(input) {
  const [template, styles, script] = await Promise.all([asset('player.html'), asset('player.css'), asset('player.js')])
  const title = escapeHtml(input.title || 'Unknown'), artist = escapeHtml(input.artist || 'Unknown')
  const image = input.imageDataUrl ?? ''
  const cover = image ? `<img class="player-cover" src="${escapeHtml(image)}" alt="${title}">` : '<div class="player-cover"></div>'
  const backdrop = image ? `<img class="player-backdrop-image" src="${escapeHtml(image)}" alt="">` : ''
  const data = JSON.stringify({ socketUrl: input.socketUrl, mimeType: input.mimeType || 'audio/mp4', lyrics: input.lyrics.map(line => ({ start_ms: line.startMs, end_ms: line.endMs, text: line.text })) }).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')
  const total = Math.max(0, Math.floor((input.durationMs ?? 0) / 1000))
  const duration = `${Math.floor(total / 60)}:${String(total % 60).padStart(2,'0')}`
  return `<style>\n${styles}\n</style>\n${template.replaceAll('{{BACKDROP}}',backdrop).replaceAll('{{COVER}}',cover).replaceAll('{{TITLE}}',title).replaceAll('{{ARTIST}}',artist).replaceAll('{{DURATION}}',duration)}\n<script>window.__SNOWKIT_PLAYER__=${data}</script>\n<script>\n${script}\n</script>`
}
function escapeHtml(v){ return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;') }
