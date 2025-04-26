const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banir')
    .setDescription('Bane um usuário do servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário que você deseja banir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razao')
        .setDescription('A razão do banimento')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('dias')
        .setDescription('Número de dias para excluir mensagens (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razao') || 'Nenhuma razão fornecida';
    const deleteMessageDays = interaction.options.getInteger('dias') || 0;
    
    try {
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      
      // Verificar se o usuário pode ser banido
      if (!targetMember.bannable) {
        return interaction.reply({ 
          content: 'Não posso banir este usuário. Ele pode ter permissões mais altas que as minhas.', 
          ephemeral: true 
        });
      }
      
      // Verificar se o usuário que executa o comando tem permissão mais alta que o alvo
      if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
        return interaction.reply({ 
          content: 'Você não pode banir alguém com cargo igual ou superior ao seu.', 
          ephemeral: true 
        });
      }
      
      await interaction.guild.members.ban(targetUser, { 
        deleteMessageDays: deleteMessageDays,
        reason: `${reason} (Banido por ${interaction.user.tag})` 
      });
      
      await interaction.reply({
        content: `✅ **${targetUser.tag}** foi banido do servidor!\n**Razão:** ${reason}`,
      });
    } catch (error) {
      console.error('Erro ao banir usuário:', error);
      await interaction.reply({
        content: `❌ Ocorreu um erro ao tentar banir **${targetUser.tag}**. Verifique as permissões do bot.`,
        ephemeral: true
      });
    }
  },
};