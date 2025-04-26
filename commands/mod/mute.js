const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mutar')
    .setDescription('Silencia um usuário no servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário que você deseja silenciar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duracao')
        .setDescription('Duração do silenciamento (ex: 10m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razao')
        .setDescription('A razão do silenciamento')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const durationString = interaction.options.getString('duracao');
    const reason = interaction.options.getString('razao') || 'Nenhuma razão fornecida';
    
    // Converter a string de duração para milissegundos
    const duration = parseDuration(durationString);
    
    if (!duration) {
      return interaction.reply({
        content: '❌ Formato de duração inválido. Use formatos como: 10s, 5m, 2h, 1d',
        ephemeral: true
      });
    }
    
    try {
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      
      // Verificar se o usuário pode ser silenciado
      if (!targetMember.moderatable) {
        return interaction.reply({ 
          content: 'Não posso silenciar este usuário. Ele pode ter permissões mais altas que as minhas.', 
          ephemeral: true 
        });
      }
      
      // Verificar se o usuário que executa o comando tem permissão mais alta que o alvo
      if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
        return interaction.reply({ 
          content: 'Você não pode silenciar alguém com cargo igual ou superior ao seu.', 
          ephemeral: true 
        });
      }
      
      await targetMember.timeout(duration, `${reason} (Silenciado por ${interaction.user.tag})`);
      
      // Formatar a duração para exibição
      const readableDuration = formatDuration(duration);
      
      await interaction.reply({
        content: `✅ **${targetUser.tag}** foi silenciado por **${readableDuration}**!\n**Razão:** ${reason}`,
      });
    } catch (error) {
      console.error('Erro ao silenciar usuário:', error);
      await interaction.reply({
        content: `❌ Ocorreu um erro ao tentar silenciar **${targetUser.tag}**. Verifique as permissões do bot.`,
        ephemeral: true
      });
    }
  },
};

// Função para converter string de duração para milissegundos
function parseDuration(durationString) {
  const regex = /^(\d+)([smhd])$/;
  const match = durationString.match(regex);
  
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000; // segundos
    case 'm': return value * 60 * 1000; // minutos
    case 'h': return value * 60 * 60 * 1000; // horas
    case 'd': return value * 24 * 60 * 60 * 1000; // dias
    default: return null;
  }
}

// Função para formatar duração em formato legível
function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const parts = [];
  if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
  if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);
  
  return parts.join(', ');
}