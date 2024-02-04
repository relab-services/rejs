const common = require('@sergeyzwezdin/semantic-release-commits-config')

module.exports = {
    ...common,
    branches: [{ name: 'master' }, { name: 'development', channel: 'development', prerelease: 'dev' }],
    tagFormat: 'core-v${version}',
    plugins: [
        ...common.plugins,
        '@semantic-release/npm',
        [
            '@semantic-release/git',
            {
                assets: ['packages/rejs/package.json', 'packages/rejs/package-lock.json'],
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
