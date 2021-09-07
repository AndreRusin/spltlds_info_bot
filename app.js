const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const accounts = require('./acc.json');
require('dotenv').config()

const token = process.env.TOKEN_BOT; //splinterlands_statistic_bot
const bot = new TelegramBot(token, {polling: true});

let urlBalance = 'https://api.splinterlands.io/players/balances?'; //player balance
let urlCard    = 'https://api.splinterlands.io/cards/collection/'; //player cards

let count = 1;
let tempUrl = urlBalance;
let urlBalanceArr = [];
accounts.forEach(function (item) {
    if(count >= 20) {
        urlBalanceArr.push(tempUrl);
        tempUrl = urlBalance;
        count = 1;
    }

    tempUrl += 'username=' + item.name + '&';
    
    count++;
})
if(accounts.length%20) {
    urlBalanceArr.push(tempUrl)
}


bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if(msg.text === '/sum_balance') {
        getSumDEC().then(sum => {
            bot.sendMessage(chatId, 'Общий баланс: ' + sum.toFixed(2) + ' DEC');
        })
    }

    if(msg.text === '/all_balance') {
        getAllDEC().then(balance => {
            let message = '';
            balance.forEach(function(item, index) {
                message += index+1 + ') ' + item.name + ':      ' + item.DEC.toFixed(2) + ' DEC \n';
            })
            bot.sendMessage(chatId, message);   
        })
    }


    if(msg.text === '/cards') {
        accounts.forEach(function (item) {
            getPlayerCards(item.name).then(item => {
                if (item.cards.length) {
                    let message = item.player + ': ' + item.cards.length +' шт.\n'

                    item.cards.forEach(function(card) {
                        message += '------------------\n    золотая: ' 
                        + card.gold  + ' \| ' + 'цена: ' 
                        + card.buy_price + '\n------------------\n';
                    })

                    bot.sendMessage(chatId, message);
                }
                   
            })
        })   
    }
    
  });


async function getSumDEC() {
    let sum = 0;

    for (const url of urlBalanceArr) {
        let balances = await axios.get(url);
        balances.data.forEach(function(item) {
            if(item.token === 'DEC') {
                sum += item.balance;
            }
        })
    }
    
    return sum;
}

async function getAllDEC() {
    let balance = [];

    for (const url of urlBalanceArr) {
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
    }

    return balance;
}

async function getPlayerCards(playerName) {
    let playerUrl = urlCard + playerName;

    let cards = await axios.get(playerUrl);

    return cards.data;
}