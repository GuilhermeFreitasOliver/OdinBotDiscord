require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Criando o cliente do Discord com as intents necessárias
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ]
});

// Coleções para armazenar comandos e outros dados
client.commands = new Collection();
client.cooldowns = new Collection();

// Carregar configurações
let config;
try {
  config = require('./config.json');
  client.config = config;
} catch (error) {
  console.error('Arquivo de configuração não encontrado, usando valores padrão.');
  client.config = {
    welcomeChannelId: null,
    xpPerMessage: 10,
    xpLevelMultiplier: 100,
    messageOfTheDayChannelId: null,
    reactionRoles: [],
    antiFlood: {
      enabled: false,
      maxMessages: 5,
      timeWindow: 5,
      muteTime: 300000
    }
  };
}

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute" obrigatória.`);
    }
  }
}

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Registrar comandos slash
const registerCommands = async () => {
  try {
    const commands = [];
    const commandFoldersPath = path.join(__dirname, 'commands');
    const folders = fs.readdirSync(commandFoldersPath);

    for (const folder of folders) {
      const commandsPath = path.join(commandFoldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('data' in command) {
          commands.push(command.data.toJSON());
        }
      }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    console.log(`Iniciando o registro de ${commands.length} comandos slash.`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`Registrados com sucesso ${data.length} comandos slash.`);
  } catch (error) {
    console.error('Erro ao registrar comandos slash:', error);
  }
};

// Evento de login
client.once(Events.ClientReady, () => {
  console.log(`Bot online! Logado como ${client.user.tag}`);
  registerCommands();
});

// Login do bot
client.login(process.env.TOKEN);