import {isEmptyObject, sendMessage} from "./helpers.js";
import TelegramBot from "node-telegram-bot-api";

export class Game {
	members: string[];
	bot: TelegramBot;
	hours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	votes: Record<string, string | undefined> = {};

	constructor(bot: TelegramBot, members: string[]) {
		this.members = members;
		this.bot = bot
	}

	async initGame (msg: TelegramBot.Message) {
		await sendMessage(this.bot, msg, this.getGameMessage(), {
			...this.getButtons(),
		});

		this.bot.on('callback_query', async ctx => {
			try {
				if (ctx?.data?.startsWith('/restart')) {
					if (!isEmptyObject(this.votes)) {
						await this.restartGame(ctx);
					}

					return;
				}

				const key = `@${ctx.from.username}`

				if (this.members.includes(key) && !this.votes[key]) {
					this.votes[key] = ctx.data;

					await this.bot.editMessageText(this.getGameMessage(), {
						...this.getButtons(),
						chat_id: ctx.message?.chat.id,
						message_id: ctx.message?.message_id,
					} as TelegramBot.EditMessageTextOptions);

					return;
				}

				this.votes[key] = ctx.data;
			} catch (error) {
				console.log(error)
			}
		});
	}
	async restartGame (ctx: TelegramBot.CallbackQuery) {
		const { message } = ctx;
		this.votes = {}
		await this.bot.editMessageText(this.getGameMessage(), {
			...this.getButtons(),
			chat_id: message?.chat.id,
			message_id: message?.message_id,
		} as TelegramBot.EditMessageTextOptions)
	}



	getButtons (): TelegramBot.SendMessageOptions {
		if (Object.keys(this.votes).length === this.members.length) {
			return {
				reply_markup: {
					inline_keyboard: [
						[{text: "Перезапуск", callback_data: `/restart` }]
					],
				}
			}
		}
		return {
			reply_markup: {
				inline_keyboard: [
					[...this.hours.slice(
						0, Math.ceil(this.hours.length / 2)).map(
						item => ({text: String(item), callback_data: String(item)})
					)
					],
					[...this.hours.slice(
						Math.ceil(this.hours.length / 2), this.hours.length).map(
						item => ({text: String(item), callback_data: String(item)})
					)
					],
					[{text: "Перезапуск", callback_data: `/restart` }]
				],
			},
		}
	}

	getGameMessage () {
		let message = 'Участники:\n\n'
		if (isEmptyObject(this.votes)) {
			this.members.forEach(item => {
				message += `${item}\n\n`;
			})
		} else {
			if (Object.keys(this.votes).length === this.members.length) {
				this.members.forEach(item => {
					message += `${item} - ${this.votes[item]}\n\n`;
				})
				message += `Среднее значение: ${Object.values(this.votes).reduce((acc, curr) => (acc + Number(curr)), 0)/Object.values(this.votes).length}`
			} else {
				this.members.forEach(item => {
					if (this.votes[item]) {
						message += `${item} - ♠\n\n`;
					} else {
						message += `${item}\n\n`;
					}
				})
			}
		}
		return message;
	}
}

