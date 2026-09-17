import { randomUUID } from 'node:crypto'
export function createRichHtmlPayload(options) {
  const html = String(options.html || '').trim()
  const title = String(options.title || '').trim()
  if (!html || !title) throw new Error('Rich HTML requires HTML and title.')
  const responseId = `${String(options.id || 'snowkit-player').trim() || 'snowkit-player'}-${randomUUID()}`
  const trustedSources = [...new Set((options.trustedSources ?? ['snowkit']).filter(Boolean))]
  const unified = {
    __typename: 'GenAIUnifiedResponse', response_id: responseId,
    sections: [{ __typename: 'GenAIUnifiedResponseSection', view_model: {
      __typename: 'GenAISingleLayoutViewModel', primitive: {
        __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: html, trusted_sources: trustedSources
      }
    }}]
  }
  return { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { messageDisclaimerText: options.disclaimer ?? '', botResponseId: responseId } }, botForwardedMessage: { message: { richResponseMessage: { messageType: 1, submessages: [{ messageType: 2, messageText: title }], unifiedResponse: { data: Buffer.from(JSON.stringify(unified), 'utf8').toString('base64') }, contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: options.botJid ?? '867051314767696@bot' }, forwardOrigin: 4 } } } } }
}
