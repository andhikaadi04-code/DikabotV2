'use strict'
import 'dotenv/config'
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, delay } from '@sairidev/baileys-new'
import { Boom } from '@hapi/boom'
import readline from 'readline'
import pino from 'pino'
import playHandler from './plugins/play.js'
import snakeHandler from './plugins/snake.js'
import playmvHandler from './plugins/playmv.js'
import playlirikHandler from './plugins/playlirik.js'
import jarvisHandler from './plugins/jarvis.js'
import stickerHandler from './plugins/sticker.js'
import aboutHandler from './plugins/about.js'
const PREFIX='.'
const logger=pino({level:process.env.LOG_LEVEL||'silent'})
function serialize(msg, sock) {
  const m = {}

  m.key = msg.key
  m.message = msg.message
  m.chat = msg.key.remoteJid
  m.sender = msg.key.fromMe
    ? sock.user?.id
    : (msg.key.participant || msg.key.remoteJid)

  let message = msg.message

  while (
    message?.ephemeralMessage ||
    message?.viewOnceMessage ||
    message?.viewOnceMessageV2 ||
    message?.documentWithCaptionMessage
  ) {
    message =
      message.ephemeralMessage?.message ||
      message.viewOnceMessage?.message ||
      message.viewOnceMessageV2?.message ||
      message.documentWithCaptionMessage?.message
  }

  const type = Object.keys(message || {})[0]
  const content = message?.[type]

  m.text =
    type === 'conversation'
      ? message.conversation
      : type === 'extendedTextMessage'
        ? content?.text || ''
        : content?.caption || ''

  m.react = async emoji => {
    try {
      await sock.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      })
    } catch (e) {
      console.log('[REACT ERROR]', e.message)
    }
  }

  return m
}
async function getPhoneNumber(){const rl=readline.createInterface({input:process.stdin,output:process.stdout});const number=await new Promise(resolve=>rl.question('Masukkan nomor WhatsApp (contoh 628xxxxxxxxxx): ',resolve));rl.close();return String(number).trim().replace(/\D/g,'')}
let starting=false
async function start(){if(starting)return;starting=true;console.log('=========================================\n        DENZ WHATSAPP BOT\n=========================================');const {state,saveCreds}=await useMultiFileAuthState('session');let phoneNumber=null;if(!state.creds.registered){phoneNumber=await getPhoneNumber();if(!phoneNumber){starting=false;throw new Error('Nomor WhatsApp kosong')}}
const sock=makeWASocket({auth:state,logger,browser:Browsers.ubuntu('Chrome'),printQRInTerminal:false});sock.ev.on('creds.update',saveCreds)
let pairingRequested=false
sock.ev.on('connection.update',async update=>{const {connection,lastDisconnect}=update;try{if(connection==='connecting'&&!state.creds.registered&&!pairingRequested){pairingRequested=true;await delay(1500);const code=await sock.requestPairingCode(phoneNumber);console.log('=========================================\n KODE PAIRING:',code,'\n Buka WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon\n=========================================')}else if(connection==='open'){starting=false;console.log('=========================================\n ✅ Bot tersambung ke WhatsApp!\n Prefix:',PREFIX,'\n=========================================')}else if(connection==='close'){starting=false;const statusCode=new Boom(lastDisconnect?.error)?.output?.statusCode;const loggedOut=statusCode===DisconnectReason.loggedOut;console.log('Koneksi terputus.',loggedOut?'Sudah logout.':'Mencoba menyambung ulang...');if(!loggedOut)setTimeout(()=>start().catch(e=>console.error('[RECONNECT ERROR]',e.message)),3000)}}catch(e){starting=false;console.error('[CONNECTION ERROR]',e)}})
 sock.ev.on('messages.upsert',async({messages,type})=>{try{if(type!=='notify')return;const msg=messages[0];if(!msg?.message||msg.key.fromMe)return;const m=serialize(msg,sock);if(!m.text?.startsWith(PREFIX))return;const [cmdRaw,...args]=m.text.slice(PREFIX.length).trim().split(/\s+/);const command=(cmdRaw||'').toLowerCase();const text=args.join(' ');console.log(`[COMMAND] ${PREFIX}${command}`,text?`| ${text}`:'');const ctx={conn:sock,text,usedPrefix:PREFIX,command};if(playHandler.command.test(command))await playHandler(m,ctx);else if(snakeHandler.command.test(command))await snakeHandler(m,ctx);else if(playmvHandler.command.test(command))await playmvHandler(m,ctx);else if(playlirikHandler.command.test(command))await playlirikHandler(m,ctx);else if(jarvisHandler.command.test(command))await jarvisHandler(m,ctx);else
if (stickerHandler.command.test(command))await
stickerHandler(m, ctx);else   
if (aboutHandler.command.test(command))await
aboutHandler(m, ctx)}catch(e){console.error('[MESSAGE HANDLER ERROR]',e)}})
}
start().catch(e=>{starting=false;console.error('[START ERROR]',e)})
