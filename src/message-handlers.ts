import {Client, Message} from 'discord.js'

export async function handleMessage(client: Client, message: Message) {
  if (message.author.id === client.user?.id) {
    return
  }
  const yoni = ['yoni','uni','yone']
  if(message.content.toLowerCase().includes(yoni)) {
    message.channel.send('yone')
    try {
      await message.react('940082584896028762')
    } catch (e) {}
  }
}
