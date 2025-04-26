const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUser, removeCoins } = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Exibe a loja do servidor')
    .addSubcommand(subcommand =>
      subcommand
        .setName('listar')
        .setDescription('Lista todos os itens disponíveis na loja'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('comprar')
        .setDescription('Compra um item da loja')
        .addIntegerOption(option =>
          option.setName('item')
            .setDescription('Número do item que deseja comprar')
            .setRequired(true))),
  
  async execute(interaction) {
    // Verificar se o sistema de economia está ativado
    if (!interaction.client.config.economy || !interaction.client.config.economy.enabled) {
      return interaction.reply({
        content: '❌ O sistema de economia está desativado neste servidor.',
        ephemeral: true
      });
    }
    
    const subcommand = interaction.options.getSubcommand();
    
    // Verificar se há itens na loja
    const shopItems = interaction.client.config.economy.shop || [];
    if (shopItems.length === 0) {
      return interaction.reply({
        content: '❌ Não há itens disponíveis na loja no momento.',
        ephemeral: true
      });
    }
    
    if (subcommand === 'listar') {
      // Criar embed para listar itens da loja
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🛒 Loja do Servidor')
        .setDescription('Aqui estão os itens disponíveis para compra:')
        .setFooter({ text: 'Use /shop comprar [número] para comprar um item' })
        .setTimestamp();
      
      // Adicionar cada item à embed
      shopItems.forEach((item, index) => {
        embed.addFields({
          name: `${index + 1}. ${item.name} - ${item.price} moedas`,
          value: item.description || 'Sem descrição disponível'
        });
      });
      
      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'comprar') {
      const itemIndex = interaction.options.getInteger('item') - 1;
      
      // Verificar se o índice do item é válido
      if (itemIndex < 0 || itemIndex >= shopItems.length) {
        return interaction.reply({
          content: `❌ Item inválido. Use números de 1 a ${shopItems.length}.`,
          ephemeral: true
        });
      }
      
      const selectedItem = shopItems[itemIndex];
      
      try {
        // Buscar dados do usuário
        const userData = await getUser(interaction.user.id, interaction.guild.id);
        
        if (!userData) {
          return interaction.reply({
            content: '❌ Não foi possível obter suas informações. Tente novamente mais tarde.',
            ephemeral: true
          });
        }
        
        // Verificar se o usuário tem moedas suficientes
        if (userData.coins < selectedItem.price) {
          return interaction.reply({
            content: `❌ Você não tem moedas suficientes para comprar este item. Preço: ${selectedItem.price} moedas, Seu saldo: ${userData.coins} moedas.`,
            ephemeral: true
          });
        }
        
        // Processar a compra
        if (selectedItem.roleId) {
          // Se o item for um cargo
          try {
            const role = await interaction.guild.roles.fetch(selectedItem.roleId);
            
            if (!role) {
              return interaction.reply({
                content: '❌ O cargo associado a este item não existe mais.',
                ephemeral: true
              });
            }
            
            // Verificar se o bot pode dar o cargo ao usuário
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (!member.manageable || role.position >= interaction.guild.members.me.roles.highest.position) {
              return interaction.reply({
                content: '❌ Não tenho permissão para dar este cargo a você.',
                ephemeral: true
              });
            }
            
            // Dar o cargo ao usuário
            await member.roles.add(role);
            
            // Remover as moedas do usuário
            await removeCoins(interaction.user.id, interaction.guild.id, selectedItem.price);
            
            // Confirmar a compra
            const embed = new EmbedBuilder()
              .setColor('#2ECC71')
              .setTitle('✅ Compra Realizada!')
              .setDescription(`Você comprou **${selectedItem.name}** por **${selectedItem.price}** moedas!`)
              .addFields({ name: 'Cargo Adicionado', value: role.name })
              .setFooter({ text: `Saldo atual: ${userData.coins - selectedItem.price} moedas` })
              .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
          } catch (error) {
            console.error('Erro ao processar compra de cargo:', error);
            await interaction.reply({
              content: '❌ Ocorreu um erro ao processar sua compra. Tente novamente mais tarde.',
              ephemeral: true
            });
          }
        } else {
          // Para outros tipos de itens que possam ser implementados no futuro
          await interaction.reply({
            content: '❌ Este tipo de item ainda não é suportado.',
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Erro ao processar comando shop:', error);
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar seu comando. Tente novamente mais tarde.',
          ephemeral: true
        });
      }
    }
  },
};