import {Guild, BaseMessageOptions, MessagePayload, TextChannel, ThreadChannel} from 'discord.js'

export const EMOJIS = {
    star: '⭐',
}

export async function getAuditLogChannel(guild: Guild): Promise<TextChannel | undefined> {
    let channel = guild.channels.cache.find((channel) => channel.name === 'audit-log')
    if (channel instanceof TextChannel) {
        return channel
    }
    if (channel?.isThread()) {
        return undefined
    }
    const channels = await guild.channels.fetch()
    const guildChannel = channels.find((channel) => channel?.name === 'audit-log')
    if (guildChannel instanceof TextChannel) {
        return guildChannel
    }
    return undefined
}

export async function auditLogReport(
    message: string | MessagePayload | BaseMessageOptions,
    guild: Guild,
) {
    const auditLogChannel = await getAuditLogChannel(guild)
    if (!auditLogChannel) {
        return
    }
    await auditLogChannel.send(message)
}

export class ExtendableError extends Error {
    constructor(message: string, extendingClass: any) {
        super(message)
        this.name = extendingClass.name
        Object.setPrototypeOf(this, extendingClass.prototype)
    }

    toString() {
        return `[object ${this.name}]`
    }
}
export class UserError extends ExtendableError {
    constructor(message: string) {
        super(message, UserError)
    }
}

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}