import {SlashCommand} from 'slashasaurus'
import {updateToysStatus} from '../../../toys-utils'

export default new SlashCommand(
    {
        name: 'enable',
        description: 'Enable toy',
        options: [],
    },
    {
        async run(interaction) {
            await updateToysStatus(true)
            await interaction.reply({
                content: 'Toys have been enabled. Be nice :)',
            })
        }
    },
)
