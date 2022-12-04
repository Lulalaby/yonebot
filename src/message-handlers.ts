
import {Client, Message} from 'discord.js'

const wordsToReactTo = [/\byoni/i, /\buni/i, /\byone/i]

export async function handleMessage(client: Client, message: Message) {
  if (message.author.id === client.user?.id) {
    return
  }

  if (wordsToReactTo.some(regex => regex.test(message.content))) {
    message.channel.send('yone')
    try {
      await message.react('940082584896028762')
    } catch (e) {}
  }
}
