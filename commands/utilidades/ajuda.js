const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Exibe a lista de todos os comandos disponíveis')
    .addStringOption(option =>
      option.setName('comando')
        .setDescription('Nome do comando específico para obter mais informações')
        .setRequired(false)),
  
  async execute(interaction) {
    const commandName = interaction.options.getString('comando');
    
    // Se um comando específico foi solicitado
    if (commandName) {
      const command = interaction.client.commands.get(commandName);
      
      if (!command) {
        return interaction.reply({
          content: `❌ Não encontrei nenhum comando com o nome **${commandName}**.`,
          ephemeral: true
        });
      }
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Comando: /${command.data.name}`)
        .setDescription(command.data.description)
        .addFields(
          { name: 'Categoria', value: getCategoryFromCommand(command) || 'Geral' }
        );
      
      // Adicionar opções do comando, se houver
      if (command.data.options && command.data.options.length > 0) {
        const optionsText = command.data.options.map(opt => {
          const required = opt.required ? '(Obrigatório)' : '(Opcional)';
          return `• **${opt.name}**: ${opt.description} ${required}`;
        }).join('\n');
        
        embed.addFields({ name: 'Opções', value: optionsText });
      }
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // Caso contrário, mostrar todos os comandos agrupados por categoria
    const commandFolders = fs.readdirSync(path.join(__dirname, '..'));
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📚 Lista de Comandos')
      .setDescription('Aqui estão todos os comandos disponíveis. Use `/ajuda [comando]` para mais detalhes sobre um comando específico.')
      .setFooter({ text: `${interaction.client.commands.size} comandos disponíveis` })
      .setTimestamp();
    
    // Agrupar comandos por categoria (pasta)
    for (const folder of commandFolders) {
      // Ignorar arquivos que não são pastas
      if (!fs.statSync(path.join(__dirname, '..', folder)).isDirectory()) continue;
      
      const folderPath = path.join(__dirname, '..', folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
      
      if (commandFiles.length === 0) continue;
      
      // Formatar nome da categoria
      const categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
      
      // Listar comandos desta categoria
      const commandList = [];
      
      for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if (command.data && command.data.name) {
          commandList.push(`\`/${command.data.name}\` - ${command.data.description}`);
        }
      }
      
      if (commandList.length > 0) {
        embed.addFields({ name: `📁 ${categoryName}`, value: commandList.join('\n') });
      }
    }
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

// Função auxiliar para obter a categoria de um comando
function getCategoryFromCommand(command) {
  try {
    const commandPath = require.resolve(command.data.name);
    const pathParts = commandPath.split(path.sep);
    const categoryIndex = pathParts.findIndex(part => part === 'commands') + 1;
    
    if (categoryIndex > 0 && categoryIndex < pathParts.length) {
      const category = pathParts[categoryIndex];
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
    
    return 'Geral';
  } catch (error) {
    return 'Geral';
  }
}