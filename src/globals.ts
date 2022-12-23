import './init'

export const globals = {
    DEV_SERVER_ID: process.env.DEV_SERVER_ID || '',
    NODE_ENV: process.env.NODE_ENV || 'prod',
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'my-secret',
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
    DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || '',
    NODE_PORT: process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 2996,
    YONE_ID: '197560831003721738',
}
