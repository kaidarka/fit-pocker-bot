import TelegramBot from 'node-telegram-bot-api';
import {Game} from "./game.js";

const bot = new TelegramBot(process.env.API_KEY_BOT, {
	polling: {
		interval: 300,
		autoStart: true
	}
});

const commands = [
	{
		command: "start",
		description: "Запуск бота"
	},
]

const sendMessage = async (tgbot, msg, info, form) => {
	await tgbot.sendMessage(msg.chat.id, info, {
		...form,
		message_thread_id: msg.message_thread_id
	});
}

export const newGame = async (msg) => {
	const mentions =  msg.entities.filter(item => item.type === 'mention').map(item => msg.text.slice(item.offset, item.offset+item.length));
	if (!mentions.length) {
		await sendMessage(bot, msg, `Нужно упомянуть пользователей после команды!`);
		return
	}
	const game = new Game(bot, mentions);
	await game.initGame(msg);
}

bot.setMyCommands(commands);

bot.on("polling_error", err => console.log(err.data?.error.message));

bot.on('text', async (msg, asd) => {

	try {
		if(msg.text.startsWith('/start')) {
			console.log(msg)
			await newGame(msg)
		}
		else {
			await bot.sendMessage(msg.chat.id, msg.text);
		}
	}
	catch(error) {
		console.log(error);
	}
})
