const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('expulsar')
    .setDescription('Expulsa um usuário do servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário que você deseja expulsar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razao')
        .setDescription('A razão da expulsão')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razao') || 'Nenhuma razão fornecida';
    
    try {
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      
      // Verificar se o usuário pode ser expulso
      if (!targetMember.kickable) {
        return interaction.reply({ 
          content: 'Não posso expulsar este usuário. Ele pode ter permissões mais altas que as minhas.', 
          ephemeral: true 
        });
      }
      
      // Verificar se o usuário que executa o comando tem permissão mais alta que o alvo
      if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
        return interaction.reply({ 
          content: 'Você não pode expulsar alguém com cargo igual ou superior ao seu.', 
          ephemeral: true 
        });
      }
      
      await targetMember.kick(`${reason} (Expulso por ${interaction.user.tag})`);
      
      await interaction.reply({
        content: `✅ **${targetUser.tag}** foi expulso do servidor!\n**Razão:** ${reason}`,
      });
    } catch (error) {
      console.error('Erro ao expulsar usuário:', error);
      await interaction.reply({
        content: `❌ Ocorreu um erro ao tentar expulsar **${targetUser.tag}**. Verifique as permissões do bot.`,
        ephemeral: true
      });
    }
  },
};