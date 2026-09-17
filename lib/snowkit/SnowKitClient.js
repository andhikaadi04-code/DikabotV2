import { SnowKit } from '@luanxdd/snowkit'
import { SnowKitPlayer } from '@luanxdd/snowkit/player'
export class SnowKitMusic {
  #catalog; #player; #market
  constructor(config){ const options={baseUrl:config.endpoint,token:config.token}; this.#catalog=new SnowKit(options); this.#player=new SnowKitPlayer(options); this.#market=config.market ?? 'BR' }
  async resolve(input){ if(isSpotifyReference(input)) return this.#catalog.catalog.resolve(input,{market:this.#market}); if(looksLikeUrl(input)) throw new Error('unsupported_music_url'); const results=await this.#catalog.catalog.songs.search(input,{limit:1,market:this.#market}); const song=results.data[0]; if(!song) throw new Error('song_not_found'); return song }
  ready(songId){ return this.#player.ready(songId,{market:this.#market,intervalMs:1000,timeoutMs:5*60*1000}) }
}
function isSpotifyReference(input){const n=input.trim();if(/^spotify:(?:track|album):/iu.test(n))return true;try{const u=new URL(n);return u.protocol==='https:'&&u.hostname.toLowerCase()==='open.spotify.com'}catch{return false}}
function looksLikeUrl(input){try{new URL(input);return true}catch{return false}}
