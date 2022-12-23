import {EMOJIS} from './utils'
import {discordClient} from './discord-client'
import {
    ActionRowBuilder, ButtonBuilder,
    Colors, EmbedBuilder, MessageActionRowComponentBuilder,
    MessageReaction,
    PartialMessageReaction,
    TextChannel,
} from 'discord.js'
import PQueue from 'p-queue'
import e from './edgeql-js'
import {edgedbClient} from './edgedb'
import {ButtonStyle} from 'discord-api-types/v10'

export const STARBOARD_THRESHOLD = 3
export const STARBOARD_CHANNEL_DEFAULT_NAME = 'starboard'

export const starboardUpdateQueue = new PQueue()

export function handleStarboardUpdate(reaction: MessageReaction | PartialMessageReaction) {
    starboardUpdateQueue.add(() => handleStarboardUpdateInternal(reaction))
}

async function handleStarboardUpdateInternal(reaction: MessageReaction | PartialMessageReaction) {
    if (!reaction.message.inGuild()) {
        return
    }
    const message = await reaction.message.fetch()
    if (!message.member || !message.inGuild()) {
        return
    }
    const messageId = message.id
    const numStars = message.reactions.cache.get(reaction.emoji.toString())?.count ?? 0

    if (!message.member) {
        return
    }
    const guild = discordClient.guilds.cache.get(message.guildId)
    if (!guild) {
        console.error(`Guild ${message.guildId} not found when updating starboard`)
        return
    }
    const starboardChannel = guild.channels.cache.find(
        (channel) => channel.name === STARBOARD_CHANNEL_DEFAULT_NAME,
    )
    if (!starboardChannel || !(starboardChannel instanceof TextChannel)) {
        return
    }

    const embed = new EmbedBuilder()
        .setAuthor({
            name: message.member.displayName,
            iconURL: message.member.displayAvatarURL({size: 16}),
        })
        .setColor(Colors.Blue)
        .setDescription(message.content)
    const attachment = message.attachments.first()
    if (attachment) {
        embed.setImage(attachment.url)
    }

    embed
        .setTimestamp(message.createdAt)
        .addFields(
            [{
                name: 'Channel',
                value: `<#${message.channelId}>`
            }, {
                name: '# Stars', value: `${numStars} ${EMOJIS.star}`
            }]
        )

    const component = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
            .setURL(message.url)
            .setLabel('Go to message')
            .setStyle(ButtonStyle.Primary),
    ).toJSON()

    const starboardMessageModels = await e
        .select(e.StarboardMessage, (s) => ({
            starredMessageId: true,
            starboardMessageId: true,
            filter: e.op(s.starredMessageId, '=', messageId),
        }))
        .run(edgedbClient)

    const starboardMessageModel = starboardMessageModels[0]

    if (!starboardMessageModel) {
        if (numStars < STARBOARD_THRESHOLD) {
            return
        }
        const message = await starboardChannel.send({
            embeds: [embed],
            components: [component],
        })
        await e
            .insert(e.StarboardMessage, {
                starredMessageId: messageId,
                starboardMessageId: message.id,
            })
            .run(edgedbClient)
    } else {
        const starboardMessage = await starboardChannel.messages.fetch(
            starboardMessageModel.starboardMessageId,
        )
        await starboardMessage.edit({embeds: [embed], components: [component]})
    }
}
