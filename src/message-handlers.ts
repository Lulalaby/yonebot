import {Client, Message} from 'discord.js'
import {globals} from './globals'

const yoneReactions = [/\byoni/i, /\buni/i, /\byone/i]
const yoneMentions = [/\bdaddy/i]
const lalaMentions = [/\bmommy/i]

export async function handleMessage(client: Client, message: Message) {
    if (message.author.id === client.user?.id) {
        return
    }

    if (yoneReactions.some((regex) => regex.test(message.content))) {
        try {
            await message.react('940082584896028762')
        } catch (e) {}
    }

    if (yoneMentions.some((regex) => regex.test(message.content))) {
        await message.channel?.send(`<@${globals.YONE_ID}>`)
    }

    if (lalaMentions.some((regex) => regex.test(message.content))) {
        await message.channel?.send(`<@${globals.LALA_ID}>`)
    }
}
