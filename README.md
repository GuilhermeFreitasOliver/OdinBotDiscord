# Bot Discord Odin

Um bot completo para Discord com sistema de boas-vindas, auto-roles, XP, moderação e eventos automáticos.

## Funcionalidades

- **Sistema de Boas-vindas**: Mensagens personalizadas para novos membros
- **Auto-Roles**: Atribuição automática de cargos por reação
- **Sistema de XP**: Ganhe experiência ao enviar mensagens e suba de nível
- **Sistema de Economia**: Moedas, loja e comandos diários
- **Moderação**: Comandos para banir, expulsar, silenciar e desmutar usuários
- **Mensagem do Dia**: Envio automático de mensagens diárias

## Requisitos

- Node.js 16.9.0 ou superior
- NPM (Node Package Manager)
- Conta no Discord Developer Portal
- MongoDB (opcional, para sistemas de XP e economia)

## Instalação

1. Clone este repositório ou baixe os arquivos
2. Instale as dependências:

```bash
npm install
```

## Configuração

### 1. Configurar o arquivo .env

Crie um arquivo `.env` na raiz do projeto baseado no arquivo `.env.example`:

```env
# Configurações do Bot
TOKEN=seu_token_do_discord_aqui
CLIENT_ID=id_do_seu_bot_aqui
GUILD_ID=id_do_seu_servidor_aqui

# Configuração do MongoDB (opcional, para sistema de XP e economia)
MONGODB_URI=sua_uri_do_mongodb_aqui
```

Para obter o TOKEN e CLIENT_ID:
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação ou selecione uma existente
3. Na seção "Bot", clique em "Reset Token" para obter o token
4. O CLIENT_ID é o "Application ID" encontrado na seção "General Information"

### 2. Configurar o arquivo config.json

Edite o arquivo `config.json` para personalizar as configurações do bot:

```json
{
  "welcomeChannelId": "ID_DO_CANAL_DE_BOAS_VINDAS",
  "xpPerMessage": 10,
  "xpLevelMultiplier": 100,
  "messageOfTheDayChannelId": "ID_DO_CANAL_PARA_MENSAGEM_DO_DIA",
  "reactionRoles": [
    {
      "messageId": "ID_DA_MENSAGEM",
      "channelId": "ID_DO_CANAL",
      "roles": [
        { "emoji": "👍", "roleId": "ID_DO_CARGO_1" },
        { "emoji": "🎮", "roleId": "ID_DO_CARGO_2" },
        { "emoji": "🎵", "roleId": "ID_DO_CARGO_3" }
      ]
    }
  ],
  "antiFlood": {
    "enabled": false,
    "maxMessages": 5,
    "timeWindow": 5,
    "muteTime": 300000
  },
  "economy": {
    "enabled": true,
    "dailyAmount": 100,
    "shop": [
      { "name": "Cargo VIP", "price": 1000, "roleId": "ID_DO_CARGO_VIP" },
      { "name": "Cargo Premium", "price": 5000, "roleId": "ID_DO_CARGO_PREMIUM" }
    ]
  }
}
```

## Executando o Bot

Para iniciar o bot localmente:

```bash
npm start
```

Ou use:

```bash
node index.js
```

## Comandos Disponíveis

### Moderação
- `/ban` - Bane um usuário do servidor
- `/kick` - Expulsa um usuário do servidor
- `/mute` - Silencia um usuário por um período determinado
- `/desmutar` - Remove o silenciamento de um usuário

### Economia
- `/balance` - Verifica seu saldo de moedas ou de outro usuário
- `/daily` - Recebe moedas diárias
- `/shop` - Acessa a loja para comprar itens e cargos

### Utilidades
- `/ajuda` - Exibe a lista de todos os comandos disponíveis

## Deploy

### Deploy no Railway

1. Crie uma conta no [Railway](https://railway.app/)
2. Conecte sua conta do GitHub
3. Crie um novo projeto a partir do seu repositório
4. Adicione as variáveis de ambiente (as mesmas do arquivo .env)
5. O Railway detectará automaticamente o Procfile e iniciará o bot

### Deploy no Render

1. Crie uma conta no [Render](https://render.com/)
2. Crie um novo "Web Service"
3. Conecte ao seu repositório GitHub
4. Configure o serviço:
   - Nome: Escolha um nome para seu bot
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Adicione as variáveis de ambiente (as mesmas do arquivo .env)
6. Clique em "Create Web Service"

## Estrutura do Projeto

```
├── commands/              # Pasta com todos os comandos do bot
│   ├── economia/          # Comandos relacionados à economia
│   ├── moderacao/         # Comandos de moderação
│   └── utilidades/        # Comandos utilitários
├── .env.example           # Exemplo de configuração das variáveis de ambiente
├── config.json            # Configurações gerais do bot
├── index.js               # Arquivo principal do bot
├── package.json           # Dependências e scripts
└── Procfile               # Configuração para deploy em plataformas como Railway e Render
```

## Personalização

### Sistema de Boas-vindas
Defina o ID do canal de boas-vindas no arquivo `config.json` para ativar mensagens automáticas quando novos membros entrarem no servidor.

### Auto-Roles
Configure as reações que atribuem cargos no arquivo `config.json`. Você precisará dos IDs da mensagem, do canal e dos cargos que deseja atribuir.

### Sistema de XP
Ajuste a quantidade de XP por mensagem e o multiplicador de nível no arquivo `config.json`.

### Sistema de Economia
Personalize os valores diários e os itens da loja no arquivo `config.json`.

## Suporte

Se encontrar algum problema ou tiver dúvidas sobre o bot, abra uma issue no repositório do GitHub.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.