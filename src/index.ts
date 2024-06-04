import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";

import {Game} from "./game.js";
import {sendMessage} from "./helpers.js";

dotenv.config();

const bot = new TelegramBot(process.env.API_KEY_BOT || '', {
    polling: {
        autoStart: true,
    },
});

const commands:  TelegramBot.BotCommand[] = [
    {
        command: "start",
        description: "Запуск бота",
    },
];

async function newGame (msg: TelegramBot.Message) {
    const { entities, text} = msg;

    if (!text) {
        await sendMessage(bot, msg, `Нужно упомянуть пользователей после команды через пробел!`);
        return
    }

    const mentions = entities?.filter(({type}) => type === "mention")
        .map(({ offset, length}) => text.slice(offset, offset + length)) || [];

    if (!mentions?.length) {
        await sendMessage(bot, msg, `Нужно упомянуть пользователей после команды через пробел!`);
        return;
    }
    const game = new Game(bot, mentions);
    await game.initGame(msg);
}

void bot.setMyCommands(commands);

bot.on("polling_error", (err: any) => console.log(err?.message));

bot.on("text", async (msg: TelegramBot.Message) => {
    try {
        if (msg.text?.startsWith("/start")) {
            await newGame(msg);
        }
    } catch (error) {
        console.log(error);
    }
});
