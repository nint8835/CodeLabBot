import Commando from 'discord.js-commando';
import { config as configDotenv } from 'dotenv';
import { Message, GuildChannel } from 'discord.js';
import { VM } from 'vm2';
import eslintCode from './utils';

configDotenv();

const EVAL_ENABLED_SERVERS = ['497544520695808000'];

const javascriptBlockRegex = /(`(?:``))(?:js|javascript|ts|typescript)\n((?:.|\n)*)(?:\1)/;

const client = new Commando.CommandoClient({
  owner: '106162668032802816',
});
client.on('message', async (message: Message) => {
  const matches = javascriptBlockRegex.exec(message.content);
  if (matches !== null && !message.author.bot) {
    const code = matches[2];
    const eslintOutput = await eslintCode(code);
    if (eslintOutput) {
      message.reply(eslintOutput);
    }

    if (
      code.indexOf('// codelab eval') !== -1
      && message.channel instanceof GuildChannel
      && EVAL_ENABLED_SERVERS.includes(message.guild.id)
    ) {
      const vm = new VM({
        timeout: 1000,
      });
      try {
        message.reply(['', '```js', vm.run(code), '```'].join('\n'));
      } catch (e) {
        if (e instanceof Error) {
          message.reply(['', '```', e.message, '```'].join('\n'));
        }
      }
    }
  }
});

client.login(process.env.CODELAB_DISCORD_TOKEN);
