const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const accounts = require('./acc.json');
require('dotenv').config()

const token = process.env.TOKEN_BOT; //splinterlands_statistic_bot
const bot = new TelegramBot(token, {polling: true});

let url = 'https://api.splinterlands.io/players/balances?';

accounts.forEach(function (item) {
    url = url + 'username=' + item.name + '&';
})


bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if(msg.text === '/sum_balance') {
        getSumDEC().then(sum => {
            bot.sendMessage(chatId, 'Общий баланс: ' + sum + 'DEC');
        })
    }

    if(msg.text === '/all_balance') {
        getAllDEC().then(balance => {
            balance.forEach(function(item) {
                bot.sendMessage(chatId, item.name + ': ' + item.DEC + 'DEC');
            })    
        })
    }
    
  });


async function getSumDEC() {
    let sum = 0;

    let balances = await axios.get(url);

    balances.data.forEach(function(item) {
        if(item.token === 'DEC') {
            sum += item.balance;
        }
    })

    return sum;
}

async function getAllDEC() {
    let balance = [];

    let balances = await axios.get(url);

    balances.data.forEach(function(item) {
        if(item.token === 'DEC') {
            user = {
                'name': item.player,
                'DEC': item.balance
            }
            balance.push(user)
        }
    })

    return balance;
}