const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const accounts = require('./acc.json');
require('dotenv').config()

const token = process.env.TOKEN_BOT; //splinterlands_statistic_bot
const bot = new TelegramBot(token, {polling: true});

let urlBalance = 'https://api.splinterlands.io/players/balances?'; //player balance
let urlCard    = 'https://api.splinterlands.io/cards/collection/'; //player cards
let urlQuest   = 'https://api.splinterlands.io/players/quests?username='; //player quest

function createUrlsArray (url){
    let count = 1;
    let tempUrl = url;
    let urlBalanceArr = [];
    accounts.forEach(function (item) {
        if(count >= 15) {
            urlBalanceArr.push(tempUrl);
            tempUrl = url;
            count = 1;
        }

        tempUrl += 'username=' + item.name + '&';
        
        count++;
    })
    if(accounts.length%15) {
        urlBalanceArr.push(tempUrl);
    }

    return urlBalanceArr;
}

let urlBalanceArr = createUrlsArray(urlBalance);


bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if(msg.text === '/sum_balance') {
        getSumDEC().then(sum => {
            bot.sendMessage(chatId, 'Общий баланс: ' + sum.toFixed(4) + ' DEC');
        })
    }

    if(msg.text === '/all_balance') {
        getAllDEC().then(balance => {
            let message = '';
            balance.forEach(function(item, index) {
                message += index+1 + ') ' + item.name + ':      ' + item.DEC.toFixed(4) + ' DEC \n';
            })
            bot.sendMessage(chatId, message);   
        })
    }

    if(msg.text === '/cards') {
            getPlayerCards().then(message => {
                bot.sendMessage(chatId, message);                 
            })   
    }

    if(msg.text === '/quests') {
        getActiveQuest().then(message => {
            bot.sendMessage(chatId, message);
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
    let message = '';
    let index = 1;

    for (const item of accounts) {
        let playerUrl = urlCard + item.name;
        let cards = await axios.get(playerUrl);
        let index = 1;

        if (cards.data.cards.length) {
            message += index + ')' + cards.data.player + ': ' 
                        + cards.data.cards.length +' шт.\n'

            cards.data.cards.forEach(function(card) {
                message += '------------------\n    золотая: ' 
                + card.gold  + ' \| ' + 'цена: ' 
                + card.buy_price + '\n------------------\n';
            })

            index++;
        }
    }

    if(message === '') {
        return 'Нету ни одной карты(';
    }
    return message;
}

async function getActiveQuest() {
    let message = '';
    let index = 1;

    for (const item of accounts) {
        let playerUrl = urlQuest + item.name;
        let cards = await axios.get(playerUrl);

        if(cards.data[0].completed_items < 5)
        {
            message += index 
                        + ')' 
                        + cards.data[0].player 
                        + ':     ' 
                        + cards.data[0].completed_items 
                        + '/' 
                        + cards.data[0].total_items + '\n';
            index++;
        }
    }

    return message;
}