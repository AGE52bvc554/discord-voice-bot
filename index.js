// index.js
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const express = require('express');

const NOTIFY_CHANNEL_NAME = process.env.NOTIFY_CHANNEL_NAME || '通話通知';
const NOTIFY_CHANNEL_ID = process.env.NOTIFY_CHANNEL_ID || null;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// BOT起動時
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// 入退室イベント
client.on('voiceStateUpdate', (oldState, newState) => {
    const joined = !oldState.channel && newState.channel;
    const left = oldState.channel && !newState.channel;
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const textChannel =
        (NOTIFY_CHANNEL_ID && guild.channels.cache.get(NOTIFY_CHANNEL_ID)) ||
        guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.name === NOTIFY_CHANNEL_NAME);

    // デバッグログ：チャンネル取得確認
    console.log('DEBUG: textChannel =', textChannel ? textChannel.name : 'null');

    if (!textChannel) return;

    if (joined) {
        console.log(`DEBUG: ${newState.member.displayName} joined ${newState.channel.name}`);
        textChannel.send(`🔔 ${newState.member.displayName} さんが ${newState.channel.name} に参加しました！`);
    } else if (left) {
        console.log(`DEBUG: ${oldState.member.displayName} left ${oldState.channel.name}`);
        textChannel.send(`👋 ${oldState.member.displayName} さんが ${oldState.channel.name} から退出しました！`);
    }
});

// Webサーバー必須（Renderでデプロイするため）
const app = express();
app.get('/', (_, res) => res.send('Bot is running'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP server running on ${PORT}`));

const TOKEN = process.env.TOKEN;

console.log('TOKEN length:', TOKEN?.length);

if (!TOKEN) {
    console.error('❌ TOKEN is undefined');
    process.exit(1);
}

client.login(TOKEN)
    .then(() => console.log('✅ Discord login success'))
    .catch(err => console.error('❌ Discord login failed', err));