# chatGPT-fake-user

`chatGPT-fake-user` is a Discord bot that pretends to be a member of your Discord server. It uses the power of OpenAI's GPT-3 for generating realistic responses and interacting within your server. This bot can make your server more engaging and fun by simulating lively conversations with a fake user!

## Prerequisites

To use this bot, you'll need:

-   An OpenAI API key (obtainable at https://beta.openai.com/signup/)
-   A Discord Bot token (follow the instructions at https://discordpy.readthedocs.io/en/stable/discord.html)

## Setup

1. Clone this repository:

```bash
git clone https://github.com/Markussim/chatGPT-fake-user.git
```

2. Change into the cloned directory:

```bash
cd chatGPT-fake-user
```

3. Install the required packages:

```bash
npm install
```

4. Create a `.env` file and replace `YOUR_API_KEY`, `YOUR_DISCORD_TOKEN`, `YOUR_DISCORD_USER_ID`, `YOUR_PROMPT`, and `YOUR_BOT_NAME` with your corresponding values:

```bash
OPENAI_API_KEY=YOUR_API_KEY
DISCORD_TOKEN=YOUR_DISCORD_TOKEN
ADMIN_USER_ID=YOUR_DISCORD_USER_ID
PERSON_PROMPT=YOUR_PROMPT
FAKE_PERSON_NAME=YOUR_BOT_NAME
```

5. Build the project:

```bash
npm run build
```

6. Run the bot:

```bash
npm run start
```

Alternatively, use `docker-compose` to run the bot with Docker:

```bash
docker-compose up -d
```

## Usage

Invite the bot to your Discord server by following the instructions at https://discordpy.readthedocs.io/en/stable/discord.html. Once your bot is active, it will automatically engage in conversations based on the provided prompt.

To mention the bot and start a conversation, use the "@" symbol followed by the bot's name. For example:

```
@FakeUser Hi, how are you?
```

The bot will then respond according to the provided prompts, simulating a conversation with a fake user.

## Admin Commands

As the administrator, use your Discord user ID to execute special commands for the bot:

-   **!hide**: Ignore the message containing the command.

-   **!prompt [new_prompt]**: Set a new prompt for the bot's conversation.

-   **!forget**: Ignore all messages received before the command.

## Contributing

Feel free to contribute to this project! Pull requests and issues are always welcome.

## License

This project is open-source and available under the MIT License. See [LICENSE](LICENSE) for more details.
