import { SnowKitWhatsAppPlayer } from '../lib/snowkit/SnowKitWhatsAppPlayer.js'
import { BaileysRichHtmlSender } from '../lib/snowkit/BaileysRichHtmlSender.js'
let player
const handler = async (m,{conn,text,usedPrefix,command}) => {
  if(!text) throw `Contoh:\n${usedPrefix+command} Alan Walker Faded`
  if(!process.env.SNOWKIT_TOKEN) throw new Error('SNOWKIT_TOKEN belum diisi di .env')
  await m.react('⏳')
  try {
    if(!player) player=new SnowKitWhatsAppPlayer(new BaileysRichHtmlSender(conn),{endpoint:process.env.SNOWKIT_ENDPOINT||'https://snow.kairogg.com.br',token:process.env.SNOWKIT_TOKEN,market:process.env.SNOWKIT_MARKET||'BR'})
    await player.send(m.chat,text,m)
    await m.react('✅')
  } catch(error) {
    console.error('[PLAYLIRIK ERROR]',error)
    await m.react('❌')
    await conn.sendMessage(m.chat,{text:'❌ Gagal membuat player lirik.\n\n> '+(error?.message||'Unknown error')},{quoted:m})
  }
}
handler.help=['playlirik'];handler.tags=['music'];handler.command=/^playlirik$/i;handler.limit=true
export default handler
