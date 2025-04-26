const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('desmutar')
    .setDescription('Remove o silenciamento de um usuário no servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário que você deseja desmutar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razao')
        .setDescription('A razão para remover o silenciamento')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razao') || 'Nenhuma razão fornecida';
    
    try {
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      
      // Verificar se o usuário está silenciado
      if (!targetMember.communicationDisabledUntil) {
        return interaction.reply({ 
          content: 'Este usuário não está silenciado.', 
          ephemeral: true 
        });
      }
      
      // Verificar se o usuário que executa o comando tem permissão mais alta que o alvo
      if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
        return interaction.reply({ 
          content: 'Você não pode desmutar alguém com cargo igual ou superior ao seu.', 
          ephemeral: true 
        });
      }
      
      // Remover o timeout (silenciamento)
      await targetMember.timeout(null, `${reason} (Desmutado por ${interaction.user.tag})`);
      
      await interaction.reply({
        content: `✅ **${targetUser.tag}** foi desmutado!\n**Razão:** ${reason}`,
      });
    } catch (error) {
      console.error('Erro ao desmutar usuário:', error);
      await interaction.reply({
        content: `❌ Ocorreu um erro ao tentar desmutar **${targetUser.tag}**. Verifique as permissões do bot.`,
        ephemeral: true
      });
    }
  },
};