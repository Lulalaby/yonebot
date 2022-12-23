import {SlashCommand} from 'slashasaurus'
import {updateToysStatus} from '../../../toys-utils'

export default new SlashCommand(
    {
        name: 'disable',
        description: 'Disable toy',
        options: [],
    },
    {
        async run(interaction) {
            await updateToysStatus(false)
            await interaction.reply({
                content: 'Toys have been abused and are now off :(',
            })
        }
    },
)
