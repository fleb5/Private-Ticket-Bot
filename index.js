/*
  _____.__        ___.    .________
_/ ____\  |   ____\_ |__  |   ____/
\   __\|  | _/ __ \| __ \ |____  \ 
 |  |  |  |_\  ___/| \_\ \/       \
 |__|  |____/\___  >___  /______  /
                 \/    \/       \/ 
        Developed by fleb5
*/
// Discord Js
const { MessageButton, MessageActionRow} = require('discord.js');
const { Client, Intents } = require('discord.js');
const client = new Client({ 
    partials: ["CHANNEL"], 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    autoReconnect: true,
    disableEveryone: true,
    fetchAllMembers: true,
});
client.discord = require('discord.js');

// Fs
client.fs = require('fs'); 

// Chalk
client.chalk = require("chalk");

// Transcript
client.discordTranscripts = require('discord-html-transcripts');

// Config
client.config = require('./config.json');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on("error", console.error);
client.on("warn", console.warn);
client.login(client.config.bot.token);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on('ready', () => {
  console.log(client.chalk.green("Log: ") + `Bot startato corretamente`)
  console.log(client.chalk.green("Log: ") + "BOT Connesso "+ client.chalk.blueBright("["+ client.user.tag + "]"));
  client.user.setActivity(`Support - BOT`, { type: 'WATCHING' })
  console.log(String.raw`
  _____.__        ___.    .________
_/ ____\  |   ____\_ |__  |   ____/
\   __\|  | _/ __ \| __ \ |____  \ 
 |  |  |  |_\  ___/| \_\ \/       \
 |__|  |____/\___  >___  /______  /
                 \/    \/       \/ 
        Developed by fleb5
`);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on('messageCreate', async message => {
  if (message.channel.type == 'DM') {
    if(message.author.id == client.config.bot.clientid) return;
    if (!client.guilds.cache.get(client.config.server.idguild).channels.cache.find(c => c.topic == message.author.id)) {
      client.guilds.cache.get(client.config.server.idguild).channels.create(`${message.author.username}-ticket`, {
        type: "text",
        parent: client.config.categorie.ticket,
        topic: message.author.id,
  
  
        permissionOverwrites: [
            { id: client.config.ruoli.staff, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
            { id: client.guilds.cache.get(client.config.server.idguild).id, deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'] }
        ]
      }).then(channel => {
        const embed = new client.discord.MessageEmbed()
          .setTitle("Nuovo Ticket")
          .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
          .setDescription("Messaggio: \n```"+ message.content +"```")
          .setColor("BLUE")
          .setTimestamp()
          .setFooter({ text: `Developed by fleb5®` })

        var row = new MessageActionRow().addComponents(
          new MessageButton()
              .setLabel("Chiudi")
              .setStyle("DANGER")
              .setCustomId("chiudi_click"),
        )
  
        channel.send({embeds: [embed], components: [row]})
      });
      const embed = new client.discord.MessageEmbed()
        .setTitle("Support Bot")
        .setDescription("**<@"+ message.author.id +"> Grazie per aver aperto un ticket!** \n Uno Staffer sarà presto disponibile per prestarti supporto! \n\nTesto: ```"+ message.content + "``` ")
        .setColor("BLUE")
        .setTimestamp()
        .setFooter({ text: `Developed by fleb5®` })
      message.author.send({embeds: [embed]}).catch(console.error);
    } else {
      const embed = new client.discord.MessageEmbed()
        .setTitle("Support Bot")
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setDescription("Messaggio: \n```"+ message.content +"```")
        .setColor("BLUE")
        .setTimestamp()
        .setFooter({ text: `Developed by fleb5®` })
      client.guilds.cache.get(client.config.server.idguild).channels.cache.find(c => c.topic == message.author.id).send({embeds: [embed]});
      message.react("✅");
    }
  }else{
    if(message.author.id == client.config.bot.clientid) return;
    if (!message.channel.name.includes('ticket')) return;
    const user = await client.users.fetch(message.channel.topic).catch(console.error);
    const embed = new client.discord.MessageEmbed()
      .setTitle("Support Bot")
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription("Risposta: \n```"+ message.content +"```")
      .setColor("BLUE")
      .setTimestamp()
      .setFooter({ text: `Developed by fleb5®` })
    user.send({embeds: [embed]}).catch(console.error);
    message.react("✅");
  }
});

client.on('interaction', async interaction => {
  if (!interaction.isButton()) return;
  if (!interaction.member?.roles.cache.has(client.config.ruoli.staff)) return interaction.reply({content: "Non hai il permesso di farlo!", ephemeral: true});
  if (interaction.customId == "chiudi_click") {
    interaction.deferUpdate();
    const user = await client.users.fetch(interaction.channel.topic).catch(console.error);
    const embed = new client.discord.MessageEmbed()
      .setTitle("Support Bot")
      .setDescription(`Ticket Chiuso da <@${interaction.member.id}>`)
      .setColor("BLUE")
      .setTimestamp()
      .setFooter({ text: `Developed by fleb5®` })
    user.send({embeds: [embed]}).catch(console.error);

    const attachment = await client.discordTranscripts.createTranscript(interaction.channel);
    const embed2 = new client.discord.MessageEmbed()
      .setTitle("**__Transcript__ → "+interaction.channel.name+"**")
      .addFields(
        { name: `Ticket Name:`, value: `${interaction.channel.name}`, inline: true },
        { name: `Aperto da:`, value: `<@${user.id}>`, inline: true },
        { name: `Chiuso da:`, value: `<@${interaction.member.id}>`, inline: true },
      )
      .setColor("BLUE")
      .setTimestamp()
      .setFooter({ text: `Developed by fleb5®` })
    interaction.guild.channels.cache.get(client.config.stanze.transcript).send({embeds: [embed2], files: [attachment]});

    interaction.channel.send({embeds: [embed]})
    interaction.channel.send("La stanza di cancellerà tra 5 secondi!")
    setTimeout(() => {
      interaction.channel.delete();
    }, 5000);
  }
});
