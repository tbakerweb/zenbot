var c = module.exports = {}

// mongo configuration
c.mongo = {}
c.mongo.db = 'zenbot4'

// Must provide EITHER c.mongo.connectionString OR c.mongo.host,port,username,password
c.mongo.connectionString = '' // 'mongodb://192.168.1.99:27017/?replicaSet=rs0&readPreference=nearest&appname=Zenbot&ssl=false'

// The following is not needed when c.mongo.connectionString is provided:
c.mongo.host = '192.168.1.99'
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
c.selector = 'binanceus.BTC-USD'


//
// Strategy Results: Trend EMA
c.strategy = 'trend_ema'
c.days = 7

c.order_type = 'maker'
c.markdown_buy_pct = 0.01
c.markup_sell_pct = 0.01

c.buy_pct = 99
c.sell_pct = 99
/////// RESULTS
// c.period = '24h'		//		
// c.period = '8h' 		//		
// c.period = '6h' 		//		
// c.period = '4h' 		//		
// c.period = '3h' 		//		
// c.period = '2h' 		//		
// c.period = '1h' 		//		
// c.period = '45m'		//		
// c.period = '30m'		//		
// c.period = '25m'		//		
// c.period = '20m'		//		
// c.period = '15m'		//	-2.12	-10.5
// c.period = '10m'		//	9.41	-6.07
// c.period = '7m' 		//	0.0		-7.29
// c.period = '5m' 		//	4.23	-3.7
// c.period = '4m' 		//	4.60	-8.7
c.period = '3m'			//	4.60
// c.period = '2m' 		//	1.69	-6.4
// c.period = '1m' 		//	3.10	-5.77




// Update the period_length variable to the same as period
c.period_length = c.period;
c.quarentine_time = 15


// Optional stop-order triggers:

// sell if price drops below this % of bought price (99 to disable)
c.sell_stop_pct = 99
// buy if price surges above this % of sold price (0 to disable)
c.buy_stop_pct = 99
// enable trailing sell stop when reaching this % profit (0 to disable)
c.profit_stop_enable_pct = 10
// maintain a trailing stop this % below the high-water mark of profit
c.profit_stop_pct = 5

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

// when supported by the exchange, use post only type orders.
c.post_only = false
// use separated fee currency such as binance's BNB.
c.use_fee_asset = true

// Misc options:


// defaults to a high number of lookback periods
c.keep_lookback_periods = 50000
// ms to poll new trades at
c.poll_trades = 30000
// amount of currency to start simulations with
// c.start_capital = 650
c.currency_capital = 750
// amount of asset to start simulations with
c.asset_capital = 0 // BTC 0.00937422 //
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
c.output.api.ip = '192.168.1.99' // IPv4 or IPv6 address to listen on, uses all available interfaces if omitted
c.output.api.port = 17369
