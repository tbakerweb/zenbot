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
// c.strategy = 'trend_ema'

/////// RESULTS
// Values are Percent Vs Buy_Hold
// Testing Date: 2021-02-02
// Days 7
// c.days = 7
// Buy/Sell %           // 	15/75			// 50/75		// 75/75		//	99/99		//	50/50	
// c.period = '24h' 	//  No Trades		//				//				//	 			//	
// c.period = '8h' 		//  No Trades		//				//				//	 			//	
// c.period = '6h' 		//  No Trades		//				//				//	 			//	
// c.period = '4h' 		//  No Trades		//				//				//	 			//	
// c.period = '3h' 		//  No Trades		//				//				//	 			//	No Trades
// c.period = '2h' 		//  No Trades		//				//				//	 			//	-3.72
// c.period = '1h' 		//  No Trades		//				//				//				//	-9.29
// c.period = '45m'	    //  No Trades		//	No Trades	//	No Trades	//	 No Trades	//	-5.71
// c.period = '30m'		//  -6.59 			//	-7.48 		//	-8.10		//	 -11.30		//	-3.13
// c.period = '25m'		//  -7.93			//	-7.90		//	-7.86		//	 -11.20		//	-3.90
// c.period = '20m'		//  -4.32			//	-3.13		//	-3.02		//	 -5.06		//	-4.4
// c.period = '15m'		//	-4.95			//	-3.89		//	-3.35		//	 -3.79		//	-6.14
// c.period = '10m'		//	-5.84			//	-2.2		//	-0.08		//	 +1.86		//	-5.19
// c.period = '7m' 		//	-7.85			//	-8.62		//	-9.36		//	 -10.91		//	-6.34
// c.period = '5m' 		//	-5.05			//	-0.94		//	+1.91		//	 +3.76		//	-4.52
// c.period = '2m' 		//	-5.05			//	-3.45		//	-3.07		//	 +1.95		//	-4.40
// c.period = '1m' 		//	-3.82			//	-0.07		//	+1.64		//	 +4.76		//	-4.95

//
// Strategy Results: Trend Bollinger
// c.strategy = 'trend_bollinger'
// c.bollinger_upper_bound_pct = 0
// c.bollinger_lower_bound_pct = 0

// c.buy_pct = 99
// c.sell_pct = 99
/////// RESULTS
// Values are Percent Vs Buy_Hold
// Bollinger Upper/Lower  ==  0/0%
// Testing Date: 2021-02-02
// Days 7
// c.days = 7
// Buy/Sell %           // 	15/75			//	50/75		//	75/75		//	99/99		//	50/50
// c.period = '24h' 	//  				//				//				//				//	
// c.period = '8h' 		//  				//				//				//				//	
// c.period = '6h' 		//  				//				//				//	No Trades	//	
// c.period = '4h' 		//  No Trades		//	No Trades	//	No Trades	//	-6.58		//	
// c.period = '3h' 		//  -9.73			//	-4.79		//	-1.25		//	+2.84		//	No Trades
// c.period = '2h' 		//  -9.25			//	-3.15		//	+1.21		//	+7.14		//	-7.04
// c.period = '1h' 		//  -4.02			//	-1.56		//	-1.38		//	-2.83		//	-5.33
// c.period = '45m'		//  -5.03			//	-3.84		//	-3.75		//	-5.21		//	-5.62
// c.period = '30m'		//  -8.27			//	+0.91 		//	+3.16		//	+5.58		//	-6.51
// c.period = '25m'		//  -6.11			//	-5.36		//	-3.89		//	-3.00		//	-8.22
// c.period = '20m'		//  -5.83			//	-3.78		//	-2.56		//	-0.55		//	-6.31
// c.period = '15m'		//	-5.83			//	-2.52		//	-0.28		//	+1.17		//	-6.32
// c.period = '10m'		//	-3.47			//	-6.68		//	-6.77		//	-6.31		//	-5.06
// c.period = '7m' 		//	-3.24			//	+1.79		//	+3.42		//	+3.64		//	-0.70
// c.period = '5m' 		//	-3.78			//	-0.35		//	-0.78		//	-2.14		//	-6.63
// c.period = '2m' 		//	-4.02			//	-2.86		//	-2.93		//	-6.36		//	+2.32
// c.period = '1m' 		//	-4.02			//	+1.55		//	+4.08		//	+14.33		//	+1.366



//
// Strategy Results: Multi (Original)
c.strategy = 'multi'
c.buy_pct = 99
c.sell_pct = 99
c.days = 30

/////// RESULTS
// 	Values are Percent Vs Buy_Hold
// 	Testing Date: 2021-02-02
// 	Days 7
// c.days = 7
//
// Buy/Sell %           // 	15/75			// 	50/75		// 	75/75		//	99/99		//	50/50
// c.period = '24h'		//  No Trades		//	No Trades	//	No Trades	//	-5.25		//	+0.04
// c.period = '8h' 		//  No Trades		//	-1.26		//	-0.13		//	+0.52		//	-8.97
// c.period = '6h' 		//  -4.14			//	-0.67		//	+1.05		//	+2.22		//	-0.35
// c.period = '4h' 		//  -0.39			//	+0.92		//	-0.13		//	-1.09		//	+1.19
// c.period = '3h' 		//  -4.64			//	-1.14		//	+0.65		//	+3.37		//	-3.14
// c.period = '2h' 		//  -2.7			//	-1.69		//	-1.89		//	-3.35		//	-6.45
// c.period = '1h' 		//  -5.50			//	-4.02		//	-2.96		//	-1.16		//	-4.19
// c.period = '45m'		//  -5.14			//	-4.14		//	-4.63		//	-5.79		//	-7.01
// c.period = '30m'		//  -5.14			//	-6.98 		//	-6.81		//	-7.66		//	-4.88
// c.period = '25m'		//  -5.04			//	-5.38		//	-5.36		//	-5.77		//	-5.45
// c.period = '20m'		//  -5.04			//	+2.93		//	+6.49		//	+6.66		//	-8.36
// c.period = '15m'		//	-4.94			//	-0.35		//	+1.84		//	+0.96		//	-9.59
c.period = '10m'		//	-4.94			//	+3.30		//	+2.82		//	+3.81		//	-9.6
// c.period = '7m' 		//	-2.91			//	+1.40		//	+2.40		//	+7.22		//	-13.36
// c.period = '5m' 		//	-6.38			//	-5.02		//	-6.94		//	-3.65		//	-11.79
// c.period = '2m' 		//	-4.4			//	-0.96		//	+0.912		//	+7.63		//	+2.03
// c.period = '1m' 		//	-4.4			//	-48.80		//	-123.59		//	-95.68		//	-40.81


// MULTI with 2/3 Concensus
// c.days = 14				// 99/99
// c.period = '24h'		//  
// c.period = '8h' 		//  
// c.period = '6h' 		//  
// c.period = '4h' 		//  
// c.period = '3h' 		//  
// c.period = '2h' 		//  
// c.period = '1h' 		//  
// c.period = '45m'		//  
// c.period = '30m'		//  -1.6
// c.period = '25m'		//  
// c.period = '20m'		//  
// c.period = '15m'		//	
// c.period = '10m'		//	-15.08
// c.period = '7m' 		//	
// c.period = '5m' 		//	
// c.period = '2m' 		//	
// c.period = '1m' 		//	





//
// Strategy Results: MACD
// Buy/Sell %          99 / 99

// c.strategy = 'macd'
// c.days = 14

// c.order_type = 'maker'
// c.markdown_buy_pct = 0.01
// c.markup_sell_pct = 0.01

// c.buy_pct = 99
// c.sell_pct = 99

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
// c.period = '15m'		//		
// c.period = '10m'		//	4.60	-8.79
// c.period = '7m' 		//	8.69	-5.29
// c.period = '5m' 		//	-1		-14	
// c.period = '2m' 		//	5.99	-7.55	
// c.period = '1m' 		//	Garbage Calculations :( Wait, WTF??  94% Profit, 69.91 points OVER buy hold??

/////// RESULTS
// 	Values are Percent Vs Buy_Hold
// 	Testing Date: 2021-02-04
// 	Days 30
// c.days = 14
// c.days = 7
// c.strategy = 'macd'
// Buy/Sell %           // 	15/75			// 	50/75		// 	75/75		//	99/99		//	50/50
// c.period = '24h'		//  				//				//				//				//	
// c.period = '8h' 		//  				//				//				//				//	
// c.period = '6h' 		//  				//				//				//				//	
// c.period = '4h' 		//  				//				//				//				//	
// c.period = '3h' 		//  				//				//				//				//	
// c.period = '2h' 		//  				//				//				//				//	
// c.period = '1h' 		//  				//				//				//	14.40		//	
// c.period = '45m'		//  				//				//				//				//	
// c.period = '30m'		//  				//				//				//				//	
// c.period = '25m'		//  				//				//				//				//	
// c.period = '20m'		//  				//				//				//				//	
// c.period = '15m'		//					//				//				//				//	
// c.period = '10m'		//					//				//				//				//	
// c.period = '7m' 		//					//				//				//				//	
// c.period = '5m' 		//					//				//				//				//	
// c.period = '2m' 		//					//				//				//				//	
// c.period = '1m' 		//					//				//				//				//	


//
// Strategy Results: TBW-Positions
// c.strategy = 'tbw-positions'
// c.position_target_gain_percent = 7
// c.position_size_in_usd = 100
// c.period = '60m'		// 
// c.period = '45m'		// 
// c.period = '30m'		// 
// c.period = '25m'		// 
// c.period = '20m'		// 
// c.period = '15m'		//
// c.period = '10m'		//	
// c.period = '7m' 		//	
// c.period = '5m' 		//	
// c.period = '2m' 		//	
// c.period = '1m' 		//	



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
