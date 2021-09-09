### 1)создать папку для бота на компе
### 2) открыть консоль в папке
### 3) ввести: git clone https://github.com/AndreRusin/spltlds_info_bot.git .
### 4) далее: npm install
### 5)переименовать acc.json.exemple в acc.json
### 6)заполнить его акк-ми
### 7)в телеге найти botFather, там зарегать бота нового, получаете токен
### 8) добавить там же данные команды боту:
  sum_balance - show sum balances
  all_balance - show all balances
  cards - show all cards
  quest - show active quests
### 9)в папке с ботом переименовать файл .env.exemple в .env
### 10) в этот файл ввести токен бота который был получен на шаге 7
### 11) запустить бота командой: node app.js