var c = module.exports = {}

// mongo configuration
c.mongo = {}
c.mongo.db = 'zenbot4'

// Must provide EITHER c.mongo.connectionString OR c.mongo.host,port,username,password
c.mongo.connectionString = '' // 'mongodb://192.168.1.5:27017/?replicaSet=rs0&readPreference=nearest&appname=Zenbot&ssl=false'

// The following is not needed when c.mongo.connectionString is provided:
c.mongo.host = 'lt-101.birdhouse.lan'
c.mongo.port = 27017
c.mongo.username = null
c.mongo.password = null
// when using mongodb replication, i.e. when running a mongodb cluster, you can define your replication set here; when you are not using replication (most of the users), just set it to `null` (default).
c.mongo.replicaSet = null // 'rs0'
c.mongo.authMechanism = null


// Run Quietly
// c.silent = true;


// Debug is set in the sim/exchange.js:18
// BAD!!! c.debug = false;

// default selector. only used if omitting [selector] argument from a command.
c.selector = 'binanceus.ETH-USD'


// Positions Strategy
// c.period = '30m'; c.period_length = '30m'
// c.period = '25m'; c.period_length = '25m'
// c.period = '20m'; c.period_length = '20m'
// c.period = '15m'; c.period_length = '15m'
// c.period = '10m'; c.period_length = '10m'
// c.period = '7m'; c.period_length = '7m'
c.period = '5m';  c.period_length = '5m'
// c.period = '1m';  c.period_length = '1m'
c.position_target_gain_percent = 7
c.position_size_in_usd = 100
c.strategy = 'tbw-positions'


c.quarentine_time = 15

c.buy_pct = 33
c.sell_pct = 75

//
// Standard configuration I don't often change
//



// Optional stop-order triggers:

// sell if price drops below this % of bought price (99 to disable)
c.sell_stop_pct = null//99
// buy if price surges above this % of sold price (0 to disable)
c.buy_stop_pct = null//99
// enable trailing sell stop when reaching this % profit (0 to disable)
c.profit_stop_enable_pct = 0
// maintain a trailing stop this % below the high-water mark of profit
c.profit_stop_pct = 1.5

//
// Order execution rules:
//

// avoid trading at a slippage above this pct
c.max_slippage_pct = 0.075
// ms to adjust non-filled order after
c.order_adjust_time = 5000
// avoid selling at a loss below this pct set to 0 to ensure selling at a higher price...
c.max_sell_loss_pct = 5// null, 99
// avoid buying at a loss above this pct set to 0 to ensure buying at a lower price...
c.max_buy_loss_pct = 5 // null,  99
// ms to poll order status
c.order_poll_time = 5000
// ms to wait for settlement (after an order cancel)
c.wait_for_settlement = 5000
// % to mark down buy price for orders
c.markdown_buy_pct = 0.0
// % to mark up sell price for orders
c.markup_sell_pct = 0.0
// become a market taker (high fees) or a market maker (low fees)
// c.order_type = 'maker'  // Default Setting
// Taker Fees are faster, and are the same fee on all the exchanges I'm working with.
c.order_type = 'taker'
// when supported by the exchange, use post only type orders.
c.post_only = false
// use separated fee currency such as binance's BNB.
c.use_fee_asset = true

// Misc options:

// default # days for backfill and sim commands
c.days = 14
// defaults to a high number of lookback periods
c.keep_lookback_periods = 50000
// ms to poll new trades at
c.poll_trades = 30000
// amount of currency to start simulations with
c.start_capital = 650
c.currency_capital = 500
// amount of asset to start simulations with
c.asset_capital = 0
// for sim, reverse time at the end of the graph, normalizing buy/hold to 0
c.symmetrical = false
// number of periods to calculate RSI at
c.rsi_periods = 14
// period to record balances for stats
c.balance_snapshot_period = '5m'
// avg. amount of slippage to apply to sim trades
c.avg_slippage_pct = 0.045
// time to leave an order open, default to 1 day (this feature is not supported on all exchanges, currently: GDAX)
c.cancel_after = 'day'
// load and use previous trades for stop-order triggers and loss protection (live/paper mode only)
c.use_prev_trades = false
// minimum number of previous trades to load if use_prev_trades is enabled, set to 0 to disable and use trade time instead
c.min_prev_trades = 50000


// Exchange API keys:

// to enable GDAX trading, enter your API credentials:
c.gdax = {}
c.gdax.key = 'c9d4ec5c69537bd23976f42084d151f7'
c.gdax.b64secret = 'zDQs8pYNwoo5OmyBAlingLQJmSY15xWLhgkeQFH8rteOT+PY3lV0wkGtxsnhFyZtq2xX1bYjy9HpxFf2sWZGaA=='
c.gdax.passphrase = 'q5xawlmypj'


// to enable Binance US trading, enter your API credentials:
c.binanceus = {}
c.binanceus.key = '3b3neGaipaZs2wFgGLJWaYpRND71dm5GOrNvd9QwJz4fGaWUEfSujE7bUelNbLV9'
c.binanceus.secret = 'T7AvXkKGWEztWkOsuItKIEGAVNWmU8YLJfIe8Jx83OZkRRV5tCh585Zq7Gyg54mQ'


// Notifiers:
c.notifiers = {}

c.notifiers.only_completed_trades = true // Filter to notifier's messages for getting Commpleted Trades info.

// discord configs
c.notifiers.discord = {}
c.notifiers.discord.on = true // false discord disabled; true discord enabled (key should be correct)
c.notifiers.discord.id = '758521595949613109'
c.notifiers.discord.token = 'rMExeBy9Iy7xlRCEP6Warlq_GZP--qNCUBNhNVQDYpjLVg5dvOj_ul6PuXp-howJCRuk'
c.notifiers.discord.username = 'BTC-BinanceUS-Multi'
c.notifiers.discord.avatar_url = 'https://tbakerweb.com/zenbot/mario-coin.png'
c.notifiers.discord.color = null // color as a decimal
// end discord configs

// output
c.output = {}

// REST API
c.output.api = {}
c.output.api.on = true
c.output.api.ip = '192.168.1.5' // IPv4 or IPv6 address to listen on, uses all available interfaces if omitted
c.output.api.port = 17369
