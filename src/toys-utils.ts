import e from './edgeql-js'
import {edgedbClient} from './edgedb'

export async function insertToyStatus(enabled: boolean) {
    await e.insert(e.ToyStatus, {
        enabled
    }).run(edgedbClient)
}

export async function updateToysStatus(enabled: boolean) {
    await e.update(e.ToyStatus, _ => ({
        set: {
            enabled
        }
    })).run(edgedbClient)
}

export async function getToyStatus() {
    const toyStatus = await e.select(e.ToyStatus, _ => ({enabled: true})).run(edgedbClient)
    if (toyStatus.length === 0) {
        return
    }
    return toyStatus[0]
}

export async function areToysEnabled() {
    return (await getToyStatus())?.enabled ?? false
}