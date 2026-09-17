'use strict'

import { Jimp } from 'jimp'
import webp from 'webp-wasm'
import WebP from 'node-webpmux'
import { downloadContentFromMessage } from '@sairidev/baileys-new'

async function downloadImage(message) {
    const stream = await downloadContentFromMessage(message, 'image')
    const chunks = []

    for await (const chunk of stream) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}

async function convertToWebp(input) {
    console.log('[STICKER] Reading image...')

    const image = await Jimp.read(input)

    console.log(
        `[STICKER] Image: ${image.bitmap.width}x${image.bitmap.height}`
    )

    // Maksimal 512x512, tetap menjaga rasio
    if (
        image.bitmap.width > 512 ||
        image.bitmap.height > 512
    ) {
        image.scaleToFit({
            w: 512,
            h: 512
        })
    }

    const width = image.bitmap.width
    const height = image.bitmap.height

    console.log(
        `[STICKER] Resized: ${width}x${height}`
    )

    console.log('[STICKER] Encoding WebP...')

    const imageData = {
        data: new Uint8ClampedArray(image.bitmap.data),
        width,
        height
    }

    const result = await webp.encode(
        imageData,
        {
            quality: 75,
            alpha_quality: 100
        }
    )

    return Buffer.from(result)
}

async function addMetadata(webpBuffer) {
    const img = new WebP.Image()

    await img.load(webpBuffer)

    const metadata = {
        'sticker-pack-id': 'bot-denz',
        'sticker-pack-name': 'Bot Denz',
        'sticker-pack-publisher': 'Bot Denz',
        'emojis': ['🤖']
    }

    const json = Buffer.from(
        JSON.stringify(metadata),
        'utf8'
    )

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00,
        0x41, 0x57,
        0x07, 0x00,
        0x00, 0x00,
        0x00, 0x00,
        0x16, 0x00,
        0x00, 0x00
    ])

    const exif = Buffer.concat([
        exifAttr,
        json
    ])

    exif.writeUInt32LE(json.length, 14)

    img.exif = exif

    return await img.save(null)
}

let handler = async (m, { conn }) => {

    const reply = async text => {
        return await conn.sendMessage(
            m.chat,
            { text },
            { quoted: m }
        )
    }

    try {

        let msg = m.message

        while (
            msg?.ephemeralMessage ||
            msg?.viewOnceMessage ||
            msg?.viewOnceMessageV2 ||
            msg?.documentWithCaptionMessage
        ) {
            msg =
                msg.ephemeralMessage?.message ||
                msg.viewOnceMessage?.message ||
                msg.viewOnceMessageV2?.message ||
                msg.documentWithCaptionMessage?.message
        }

        const image = msg?.imageMessage

        if (!image) {
            return await reply(
                '📸 Kirim foto dengan caption *.sticker*'
            )
        }

        await m.react('⏳')

        console.log('[STICKER] Downloading image...')

        const input = await downloadImage(image)

        console.log('[STICKER] Converting to WebP...')

        const webpBuffer = await convertToWebp(input)

        console.log('[STICKER] Adding Bot Denz metadata...')

        const sticker = await addMetadata(webpBuffer)

        console.log('[STICKER] Sending sticker...')

        await conn.sendMessage(
            m.chat,
            {
                sticker
            },
            {
                quoted: m
            }
        )

        await m.react('✅')

        console.log('[STICKER] Success!')

    } catch (error) {

        console.error('[STICKER ERROR]', error)

        try {
            await m.react('❌')
        } catch {}

        await reply(
            '❌ Gagal membuat sticker.\n\n' +
            `> ${error?.message || 'Unknown error'}`
        )
    }
}

handler.help = ['sticker', 's']
handler.tags = ['tools']
handler.command = /^(sticker|s)$/i
handler.limit = false

export default handler