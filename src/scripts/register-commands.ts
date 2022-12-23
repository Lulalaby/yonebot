import path from 'path'
import '../init'
import {globals} from '../globals'
import {SlashasaurusClient} from 'slashasaurus'

const discordClient = new SlashasaurusClient(
    {
        intents: []
    },
    {},
)

async function run() {
    await discordClient.login(globals.BOT_TOKEN)
    await discordClient.registerCommandsFrom(path.join(__dirname, '..', 'commands'), true, globals.BOT_TOKEN)
}

run()
.catch(e => console.error(e))
.then(() => process.exit(0))