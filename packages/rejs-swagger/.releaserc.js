const common = require('@relab/semantic-release-commits-config')

module.exports = {
    ...common,
    branches: [{ name: 'master' }, { name: 'development', channel: 'development', prerelease: 'dev' }],
    tagFormat: 'swagger-v${version}',
    plugins: [
        ...common.plugins,
        '@semantic-release/npm',
        [
            '@semantic-release/git',
            {
                assets: ['packages/rejs-swagger/package.json', 'packages/rejs-swagger/package-lock.json'],
                message: 'Update package.json version to ${nextRelease.version}',
            },
        ],
        '@semantic-release/github',
        [
            'semantic-release-telegram-bot',
            {
                notifications: [
                    {
                        chatIds: process.env.TELEGRAM_BOT_CHAT_ID,
                    },
                ],
            },
        ],
    ],
}
