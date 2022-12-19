import fastify, {FastifyReply, FastifyRequest} from 'fastify'
import fastifyCookie from '@fastify/cookie'
import crypto from 'crypto'
import {globals} from './globals'
import {pushMetadata, getOAuthTokens, getUserData} from './discord-api'
import {getYoneshipSite} from './yoneship-site'

const server = fastify({logger: true})

server.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'my-secret',
    hook: 'onRequest',
    parseOptions: {},
})

export function getOAuthUrl() {
    const state = crypto.randomUUID()

    const url = new URL('https://discord.com/api/oauth2/authorize')
    url.searchParams.set('client_id', globals.DISCORD_CLIENT_ID)
    url.searchParams.set('redirect_uri', globals.DISCORD_REDIRECT_URI)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('state', state)
    url.searchParams.set('scope', 'role_connections.write identify')
    url.searchParams.set('prompt', 'consent')
    return {state, url: url.toString()}
}

const cookieToUrl: Record<string, string> = {}

function homepage(request: FastifyRequest, reply: FastifyReply, success = false) {
    const {url, state} = getOAuthUrl()

    reply.setCookie('clientState', state, {maxAge: 1000 * 60 * 5, signed: true})

    cookieToUrl[state] = url

    return reply
        .header('content-type', 'text/html')
        .send(getYoneshipSite('/submit-yoneship', success))
}

server.route({
    method: 'GET',
    url: '/',
    handler: homepage,
})

server.route({
    method: 'GET',
    url: '/linked-role',
    handler: homepage,
})

server.route({
    method: 'GET',
    url: '/success',
    handler(request, reply) {
        return homepage(request, reply, true)
    },
})

server.route({
    method: 'GET',
    url: '/submit-yoneship',
    handler(request, reply) {
        const cookieState = request.unsignCookie(request.cookies['clientState'] ?? '')
        if (!cookieState.valid) {
            console.error('Invalid cookie signing')
            return reply.send(403)
        }

        return reply.redirect(cookieToUrl[cookieState.value ?? ''])
    },
})

type OAuth2CallbackRequest = FastifyRequest<{
    Querystring: {code: string; state: string}
}>

server.route({
    url: '/discord-oauth-callback',
    method: 'GET',
    schema: {
        querystring: {
            code: {type: 'string'},
        },
    },
    async handler(request: OAuth2CallbackRequest, reply) {
        try {
            // 1. Uses the code and state to acquire Discord OAuth2 tokens
            const code = request.query.code
            const discordState = request.query.state

            // make sure the state parameter exists
            const cookieState = request.unsignCookie(request.cookies['clientState'] ?? '')
            if (!cookieState.valid) {
                console.error('Invalid cookie signing')
                return reply.send(403)
            }
            const state = cookieState.value
            if (state !== discordState) {
                console.error('State verification failed.')
                return reply.send(403)
            }

            const tokens = await getOAuthTokens(code)

            await pushMetadata(tokens.access_token, {
                yoneship: 1,
            })

            return reply.redirect('/success')
        } catch (e) {
            console.error(e)
            return reply.send(500)
        }
    },
})

const start = async () => {
    try {
        await server.listen({port: globals.NODE_PORT})
        console.log('Listening on port', globals.NODE_PORT)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
