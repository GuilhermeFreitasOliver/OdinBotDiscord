const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Verifica seu saldo de moedas')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário para verificar o saldo (opcional)')
        .setRequired(false)),
  
  async execute(interaction) {
    // Verificar se o sistema de economia está ativado
    if (!interaction.client.config.economy || !interaction.client.config.economy.enabled) {
      return interaction.reply({
        content: '❌ O sistema de economia está desativado neste servidor.',
        ephemeral: true
      });
    }
    
    // Determinar qual usuário verificar
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    
    try {
      // Buscar dados do usuário
      const userData = await getUser(targetUser.id, interaction.guild.id);
      
      if (!userData) {
        return interaction.reply({
          content: `❌ Não foi possível obter as informações ${targetUser.id === interaction.user.id ? 'suas' : 'deste usuário'}.`,
          ephemeral: true
        });
      }
      
      // Criar embed para resposta
      const embed = new EmbedBuilder()
        .setColor('#4169E1')
        .setTitle(`💰 Saldo de ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Moedas', value: `${userData.coins || 0}`, inline: true },
          { name: 'Nível', value: `${userData.level || 1}`, inline: true },
          { name: 'XP', value: `${userData.xp || 0}/${userData.level * interaction.client.config.xpLevelMultiplier || 100}`, inline: true }
        )
        .setFooter({ text: `ID: ${targetUser.id}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao processar comando balance:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao processar seu comando. Tente novamente mais tarde.',
        ephemeral: true
      });
    }
  },
};