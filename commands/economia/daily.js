const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, addCoins, updateDailyTimestamp } = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Receba suas moedas diárias'),
  
  async execute(interaction) {
    // Verificar se o sistema de economia está ativado
    if (!interaction.client.config.economy || !interaction.client.config.economy.enabled) {
      return interaction.reply({
        content: '❌ O sistema de economia está desativado neste servidor.',
        ephemeral: true
      });
    }
    
    try {
      // Buscar dados do usuário
      const userData = await getUser(interaction.user.id, interaction.guild.id);
      
      if (!userData) {
        return interaction.reply({
          content: '❌ Não foi possível obter suas informações. Tente novamente mais tarde.',
          ephemeral: true
        });
      }
      
      // Verificar se o usuário já coletou as moedas hoje
      const now = new Date();
      const lastDaily = userData.lastDailyTimestamp ? new Date(userData.lastDailyTimestamp) : null;
      
      if (lastDaily) {
        // Verificar se já se passou 24 horas desde a última coleta
        const timeDiff = now - lastDaily;
        const hoursLeft = 24 - Math.floor(timeDiff / (1000 * 60 * 60));
        
        if (timeDiff < 24 * 60 * 60 * 1000) {
          const minutesLeft = 60 - Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          return interaction.reply({
            content: `⏰ Você já coletou suas moedas diárias hoje! Volte em **${hoursLeft}h ${minutesLeft}m**.`,
            ephemeral: true
          });
        }
      }
      
      // Definir a quantidade de moedas a receber
      const dailyAmount = interaction.client.config.economy.dailyAmount || 100;
      
      // Adicionar moedas ao usuário
      await addCoins(interaction.user.id, interaction.guild.id, dailyAmount);
      
      // Atualizar timestamp da última coleta
      await updateDailyTimestamp(interaction.user.id, interaction.guild.id);
      
      // Criar embed para resposta
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('💰 Recompensa Diária')
        .setDescription(`Você recebeu **${dailyAmount}** moedas!`)
        .setFooter({ text: `Saldo atual: ${userData.coins + dailyAmount} moedas` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao processar comando daily:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao processar seu comando. Tente novamente mais tarde.',
        ephemeral: true
      });
    }
  },
};