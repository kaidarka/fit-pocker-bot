export class Game {
	members;
	bot;
	hours = [
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
	];
	votes = {};


	constructor(bot, users) {
		this.members = users;
		this.bot = bot
	}

	sendMessage = async (msg, info, form) => {
		await this.bot.sendMessage(msg.chat.id, info, {
			...form,
			message_thread_id: msg.message_thread_id
		});
	}

	async restartGame (ctx, msg) {
		this.votes = {}
		await this.bot.editMessageText(this.getGameMessage(), {
			...this.getButtons(),
			chat_id: ctx.message.chat.id,
			message_id: ctx.message.message_id,
			message_thread_id: msg.message_thread_id
		})
	}

	async initGame (msg) {
		await this.sendMessage(msg, this.getGameMessage(), {
			...this.getButtons(),
			parse_mode: "HTML",
		});

		this.bot.on('callback_query', async ctx => {
			try {
				if (ctx.data.startsWith('/restart')) {
					if (Object.keys(this.votes).length) {
						await this.restartGame(ctx, msg);
					}
				} else if (this.members.includes(`@${ctx.from.username}`)) {
					if (!this.votes[`@${ctx.from.username}`]) {
						this.votes[`@${ctx.from.username}`] = ctx.data;
						await this.bot.editMessageText(this.getGameMessage(), {
							...this.getButtons(),
							chat_id: ctx.message.chat.id,
							message_id: ctx.message.message_id,
							message_thread_id: msg.message_thread_id
						})
					} else {
						this.votes[`@${ctx.from.username}`] = ctx.data;
					}
				}
			} catch (error) {
				console.log(error)
			}
		});
	}

	getButtons () {
		if (Object.keys(this.votes).length === this.members.length) {
			return {
				reply_markup: {
					inline_keyboard: [
						[{text: "Перезапуск", callback_data: `/restart` }]
					]
				}
			}
		}
		return {
			reply_markup: {
				inline_keyboard: [
					[...this.hours.slice(
						0, Math.ceil(this.hours.length / 2)).map(
						item => ({text: item, callback_data: item})
					)
					],
					[...this.hours.slice(
						Math.ceil(this.hours.length / 2), this.hours.length).map(
						item => ({text: item, callback_data: item})
					)
					],
					[{text: "Перезапуск", callback_data: `/restart` }]
				]
			},
		}
	}

	getGameMessage () {
		let message = 'Участники:\n\n'
		if (this.votes === {}) {
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

