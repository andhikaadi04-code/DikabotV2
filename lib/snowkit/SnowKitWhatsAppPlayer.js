import { SnowKitMusic } from './SnowKitClient.js'
import { inlineArtwork } from './Artwork.js'
import { buildPlayerHtml } from './PlayerHtml.js'
export class SnowKitWhatsAppPlayer {
  #music; #sender
  constructor(sender,config){this.#sender=sender;this.#music=new SnowKitMusic(config)}
  async send(chatId,input,quote){const song=await this.#music.resolve(input);const session=await this.#music.ready(song.id);const artist=song.artists.map(a=>a.name).join(', ')||'artista desconhecido';const artwork=await inlineArtwork(song.artwork?.url??song.album?.images?.[0]?.url);const html=await buildPlayerHtml({title:song.title,artist,durationMs:session.audio.durationMs??song.durationMs,socketUrl:session.audio.socketUrl,mimeType:session.audio.contentType,imageDataUrl:artwork,lyrics:session.lyrics.lines});await this.#sender.send(chatId,{html,title:`🎵 ${song.title} — ${artist}`,id:'dyno-music-player',disclaimer:'Dyno Player',trustedSources:[]},quote)}
}
