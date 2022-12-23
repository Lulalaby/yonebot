import {SlashasaurusClient} from 'slashasaurus'
import {GatewayIntentBits, Partials} from 'discord.js'
import * as path from 'path'
import {handleMessage} from './message-handlers'
import {
    handleAllReactionsRemoved,
    handleEmojiRemoved,
    handleNewReaction,
    handleReactionRemoved,
} from './reaction-handlers'
import {globals} from './globals.js'
import {UserError} from './utils'
import {handleMemberUpdate} from './member-update-handler'
import {runStartup} from './startup'

export const discordClient = new SlashasaurusClient(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
        ],
        partials: [
            Partials.User,
            Partials.Channel,
            Partials.GuildMember,
            Partials.Message,
            Partials.Reaction,
            Partials.GuildScheduledEvent,
            Partials.ThreadMember,
        ],
    },
    {},
)

discordClient.on('messageCreate', (message) => handleMessage(discordClient, message))
discordClient.on('messageReactionAdd', handleNewReaction)
discordClient.on('messageReactionRemove', handleReactionRemoved)
discordClient.on('messageReactionRemoveAll', handleAllReactionsRemoved)
discordClient.on('messageReactionRemoveEmoji', handleEmojiRemoved)
discordClient.on('guildMemberUpdate', handleMemberUpdate)

discordClient.once('ready', async () => {
    console.log(`${discordClient.user?.tag} logged in`)
    await discordClient.registerCommandsFrom(path.join(__dirname, 'commands'), false)
})

discordClient.useCommandMiddleware(async (interaction, _, __, next) => {
    try {
        await next()
    } catch (e) {
        if (e instanceof UserError) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(`:x: ${e.message}`)
            } else {
                await interaction.reply({
                    content: `:x: ${e.message}`,
                    ephemeral: true,
                })
            }
        } else {
            console.error(`Error handling command ${interaction.command?.name}`, e)
            const replyer =
                interaction.deferred || interaction.replied
                    ? interaction.editReply
                    : interaction.reply
            replyer(`Unknown server error`)
        }
    }
})

Promise.resolve()
    .then(async () => {
        try {
            await discordClient.login(globals.BOT_TOKEN)
        } catch (e) {
            console.error('Unable to login', e)
            process.exit(1)
        }
        try {
            await runStartup()
        } catch (e) {
            console.error('Failure to run startup functions', e)
        }
    })
