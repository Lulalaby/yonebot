import {getToyStatus, insertToyStatus} from './toys-utils'

export async function runStartup() {
    const toyStatus = await getToyStatus()
    if (toyStatus == undefined) {
        await insertToyStatus(true)
    }
}