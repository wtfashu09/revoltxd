const Eris = require("eris");
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()
const express = require('express')
const app = express();
const port = process.env.PORT || 3000


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new Eris(process.env.DISCORD_BOT_TOKEN, {
    intents: [
        "guildMessages"
    ]
});

bot.on('ready', () => {
    bot.editStatus("online", { name: "with Questions" });
    console.log(`Logged in as ${bot.user.username}#${bot.user.discriminator}!`);
    app.listen(port, () =>
        console.log(`Your app is listening on http://localhost:${port}`)
    );
});

bot.on("error", (err) => {
    console.error(err); 
});

bot.on("messageCreate", (msg) => {
    if (msg.author.id === bot.user.id) return; // Ignore messages sent by the bot itself
    if (msg.content.startsWith("#")) {
        runCompletion(msg.content.substring(1)).then(result => bot.createMessage(msg.channel.id, result));
    }
});

async function runCompletion (message) {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: message,
        max_tokens: 200,
    });
    return completion.data.choices[0].text;
}

bot.connect();
