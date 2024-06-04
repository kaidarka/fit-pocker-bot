import TelegramBot from "node-telegram-bot-api";

export const sendMessage = async (
    bot: TelegramBot,
    msg: TelegramBot.Message,
    info: string,
    form?: TelegramBot.SendMessageOptions
) => {
    const { chat: { id: chatId }, message_thread_id} = msg;
    await bot.sendMessage(chatId, info, {
        ...form,
        message_thread_id,
        parse_mode: "HTML",
    });
}

export function isEmptyObject(obj: any) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
}