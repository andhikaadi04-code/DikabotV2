import { createRichHtmlPayload } from './RichHtmlPayload.js'
export class BaileysRichHtmlSender { #socket; constructor(socket){this.#socket=socket} send(jid,options){return this.#socket.relayMessage(jid,createRichHtmlPayload(options),{})} }
