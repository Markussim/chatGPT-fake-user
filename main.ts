// External dependencies
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

let lastRequestTime = Date.now();

let prompt = process.env.PERSON_PROMPT ?? fs.readFileSync('defaultPrompt.txt', 'utf8');

client.on('ready', () => {
	if (!client.user) return; // This should never happen, but just in case (TypeScript)
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
	if (!client.user) return; // This should never happen, but just in case (TypeScript)

	// If the admin user types !prompt, change the prompt
	if (process.env.ADMIN_USER_ID && message.author.id === process.env.ADMIN_USER_ID && message.content.startsWith('!prompt')) {
		prompt = message.content.replace('!prompt ', '');
		message.channel.send('Prompt changed to: ' + prompt);
		return;
	}

	if (message.content.startsWith('!hide')) return;

	if (Math.random() < 0.1 || message.mentions.has(client.user)) {
		// Ignore messages from the bot
		if (message.author.id === client.user?.id) return;
		if (lastRequestTime + 1000 > Date.now()) return;
		lastRequestTime = Date.now();

		// Start indiciating that the bot is typing
		message.channel.sendTyping();
		try {
			const response = await gpt3Generate(message);

			if (response.length < 1) {
				throw new Error({
					response: {
						data: {
							error: {
								message: 'No response from OpenAI :cry:'
							}
						}
					}
				} as any);
			}

			message.channel.send(response);
		} catch (error: any) {
			console.log(error);
			message.channel.send('!hide ' + error.response.data.error.message);
		}
	} else {
		console.log('Ignored message');
	}
});

function resolveUserMentions(message: string) {
	const regex = /<@!?(\d+)>/g;
	const rolesRegex = /<@&(\d+)>/g;
	// Replace all user mentions with their username
	message = message.replace(regex, (match, id) => {
		const user = client.users.cache.get(id);
		if (!user) return match;
		return '@' + user.username;
	});

	// Get current guild
	const guild = client.guilds.cache.first();
	if (!guild) return message;

	// Replace all role mentions with their name
	message = message.replace(rolesRegex, (match, id) => {
		const role = guild.roles.cache.get(id);
		if (!role) return match;
		return '@' + role.name;
	});

	return message;
}

function reverseResolveUserMentions(message: string) {
	// Replace all usernames in mentions with their user ID
	const regex = /@(\w+)/g;
	message = message.replace(regex, (match, username) => {
		const user = client.users.cache.find((user) => user.username === username);
		if (!user) return match;
		return '<@' + user.id + '>';
	});

	return message;
}

function gpt3Generate(message: Message) {
	return new Promise<string>((resolve, reject) => {
		// Log last 60 messages in the channel
		message.channel.messages.fetch({ limit: 60 }).then(async (messages: Map<string, Message>) => {
			if (!client.user) return; // This should never happen, but just in case (TypeScript)
			// Convert the Map to an array
			const messagesArray = Array.from(messages.values());

			let gpt3String: string = '';

			let continueLoop = true;

			let numberOfMessages = 0;

			// Log the messages
			messagesArray.forEach((message) => {
				if (message.content.length < 1) return;

				let addString = '';
				addString += 'Date: ' + message.createdAt.toDateString();
				addString += ', time: ' + message.createdAt.toTimeString();
				addString += ' @' + message.author.username;
				addString += ': ';
				addString += '"' + resolveUserMentions(message.content) + '"';
				addString += '\n';

				// If the message includes an attachment, log the URL
				if (message.attachments.size > 0) {
					addString += message.attachments.first()?.url;
					addString += '\n';
				}

				if (gpt3String.length + addString.length + prompt.length > 4500) return; // Don't add the message if it would make the prompt too long (OpenAI has a limit of 1024 characters)

				if (process.env.ADMIN_USER_ID && message.author.id === process.env.ADMIN_USER_ID && message.content.startsWith('!forget')) {
					continueLoop = false;
				}

				if (!continueLoop) return;

				if (message.content.startsWith('!hide')) return;

				gpt3String = addString + gpt3String;
				numberOfMessages++;
			});

			gpt3String = `Please generate a short message as "${process.env.FAKE_PERSON_NAME ?? 'Stefan'}". Only generate a single message. Format the message like the other messages but with your own message, starting with date and "${client.user?.username}: ". The message itself should be in citations \n\n` + gpt3String;

			try {
				const completion = await openai.createChatCompletion({
					model: 'gpt-3.5-turbo-0613',
					messages: [
						{ role: 'system', content: prompt },
						{
							role: 'user',
							content: gpt3String
						}
					]
				});

				const response: ChatCompletionRequestMessage | undefined = completion.data.choices[0].message;

				console.log('Sent request to OpenAI');

				if (!response) {
					reject('No response from OpenAI');
					return;
				}

				if (!response.content) {
					reject('No response from OpenAI');
					return;
				}

				console.log('Response from OpenAI: ' + response.content);

				const message = extractMessage(response.content);
				resolve(reverseResolveUserMentions(message));
			} catch (error: any) {
				reject(error);
			}
		});
	});
}

function extractMessage(str: string) {
	const regex = /:\s*"(.*)"/;
	const match = str.match(regex);
	return match ? match[1] : '';
}

client.login(process.env.DISCORD_TOKEN);
