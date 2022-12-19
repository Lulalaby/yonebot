import {globals} from './globals'

interface YoneshipMetadata {
    yoneship: 0 | 1
}

async function getFetch() {
    return (await import('node-fetch')).default
}

export async function pushMetadata(token: string, metadata: YoneshipMetadata) {
    const fetch = await getFetch()
    const url = `https://discord.com/api/v10/users/@me/applications/${globals.DISCORD_CLIENT_ID}/role-connection`
    const body = {
        platform_name: 'Example Linked Role Discord Bot',
        metadata,
    }
    const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(
            `Error pushing discord metadata: [${response.status}] ${response.statusText}`,
        )
    }
}

export async function deleteUserMetadata(token: string) {
    await pushMetadata(token, {yoneship: 0})
}

export async function getOAuthTokens(code: string) {
    const fetch = await getFetch()
    const url = 'https://discord.com/api/v10/oauth2/token'
    const body = new URLSearchParams({
        client_id: globals.DISCORD_CLIENT_ID,
        client_secret: globals.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: globals.DISCORD_REDIRECT_URI,
    })

    const response = await fetch(url, {
        body,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    if (response.ok) {
        return (await response.json()) as Promise<{access_token: string}>
    } else {
        throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`)
    }
}

export async function getUserData(token: string) {
    const fetch = await getFetch()
    const url = 'https://discord.com/api/v10/oauth2/@me'
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    if (response.ok) {
        return await response.json()
    } else {
        throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`)
    }
}

export async function setRoleMetadata() {
    const fetch = await getFetch()
    const url = `https://discord.com/api/v10/applications/${globals.DISCORD_CLIENT_ID}/role-connections/metadata`
    const body = [
        {
            key: 'yoneship',
            name: 'Yoneship',
            description: 'You have Yoneship and are an Established Yone',
            type: 7,
        },
    ]
    const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${globals.BOT_TOKEN}`,
        },
    })
    if (response.ok) {
        const data = await response.json()
        console.log(data)
    } else {
        //throw new Error(`Error pushing discord metadata schema: [${response.status}] ${response.statusText}`);
        const data = await response.text()
        console.log(data)
    }
}
