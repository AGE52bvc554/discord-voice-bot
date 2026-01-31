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

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const joined = !oldState.channel && newState.channel;
  const left   = oldState.channel && !newState.channel;
  const guild  = newState.guild || oldState.guild;
  if (!guild) return;

  const textChannel =
    (NOTIFY_CHANNEL_ID && guild.channels.cache.get(NOTIFY_CHANNEL_ID)) ||
    guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.name === NOTIFY_CHANNEL_NAME);

  if (!textChannel) return;

  if (joined) {
    textChannel.send(`🔔 ${newState.member.displayName} さんが ${newState.channel.name} に参加しました！`);
  } else if (left) {
    textChannel.send(`👋 ${oldState.member.displayName} さんが ${oldState.channel.name} から退出しました！`);
  }
});

// Webサーバー必須（Renderはこれがないとデプロイ失敗）
const app = express();
app.get('/', (_, res) => res.send('Bot is running'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP server running on ${PORT}`));

client.login(process.env.TOKEN);
