const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Verifica seu saldo atual')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('Usuário para verificar o saldo (opcional)')
        .setRequired(false)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const balance = database.getBalance(targetUser.id);
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('💰 Saldo')
      .setDescription(`${targetUser.toString()} possui **${balance}** moedas.`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};