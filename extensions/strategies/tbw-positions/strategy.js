
// var async = require("async");
var pivot = require('../pivot/strategy')
var macd = require('../macd/strategy')
var ehlers_ft = require('../ehlers_ft/strategy')
var momentum = require('../momentum/strategy')
var crypto = require('crypto')
var Phenotypes = require('../../../lib/phenotype')
var n = require('numbro')


// Create an ID for this Strategy Session
var strategy_session_id = crypto.randomBytes(4).toString('hex')

const mongoose = require('mongoose');
// const { Schema, Model } = mongoose
// const { string } = require('mathjs')
mongoose.connect('mongodb://192.168.1.99:27017/zenbot4', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

// Create a Document Schema for Position
const positionSchema = new mongoose.Schema({

  // Bot Instance Details
  bot: {

    // Timestamps
    start_time: Date,

    // Mode
    mode: String,


    // Selector and Strategy
    selector: {},
    strategy: String,
    session_id: String,

    // Conf
    conf: String,
    options: {},
  },

  // Position Opening Event Details
  open: {
    session_id: String,
    timestamp: Date,
    execution_time: String,
    order_id: String,
    order_type: String,
    price: String,
    size: String,
    usd: String,
    fee: String,
    slippage: String
  },

  // Target Position Sell Details
  target: {
    price: String,
    usd: String,
  },

  // Closed Position Details
  closed: {
    timestamp: Date,
    session_id: String,
    price: String,
    size: String,
    usd: String,
    gain_usd: String,
    gain_percent: String,
    time_open: String
  },

  // Status and log
  status: String,
  log: [String],

});

// Create a Model Interface to the Collection
const Position = mongoose.model('Position', positionSchema);


// async function updateOpenPositions(s, cb) {


//   // Find Open Positiions:
//   //  position.status = Open
//   //  position.bot.mode = [sim | live | paper ]
//   //  bot.selector Must match the current exchange/asset
//   //  bot.session_id Must match the current session if running in Simulation

//   // Define Query
//   var query = {
//     status: 'open',
//     "bot.mode": s.options.mode,
//     "bot.selector.normalized": s.options.selector.normalized
//   }

//   // Sort the Open Positions lowest 
//   var sort = {
//     'target.price': 1
//   }

//   // Only use positions from this Simulation
//   if (s.options.mode == 'sim') {
//     query['bot.session_id'] = strategy_session_id;
//   }

//   // Query and wait for the openPositions
//   s.strategy.positions = await Position.find(query).sort(sort).exec();
//   // const openPositions = await Position.find(query).sort(sort).exec();

//   // Return to the calling execution 
//   cb();
// }



// Export the Functionality in this Strategy
module.exports = {

  // Name and Description
  name: 'tbw-positions',
  description: 'This strategy leverages Positions, by buying at a TA indicator suggestion, and records a hold/sell for that particular purchase.  Once the profitablility watermark has been exceeded, the position sells and collets profit..',
  strategy_session_id: strategy_session_id,


  // Import the Position Model
  Position: Position,
  // updateOpenPositions, updateOpenPositions,

  // Get Startup Configuration Options
  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '30m')
    this.option('period_length', 'period length, same as --period', String, '30m')

    // PIVOT
    // this.option('period_length', 'period length', String, '30m')
    this.option('min_periods', 'min periods', Number, 50)
    this.option('up', 'up', Number, 1)
    this.option('down', 'down', Number, 1)

    // MACD / TA_MACD
    // this.option('period', 'period length, same as --period_length', String, '1h')
    // this.option('period_length', 'period length, same as --period', String, '1h')
    // this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 12)
    this.option('ema_long_period', 'number of periods for the longer EMA', Number, 26)
    this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
    this.option('up_trend_threshold', 'threshold to trigger a buy signal', Number, 0)
    this.option('down_trend_threshold', 'threshold to trigger a sold signal', Number, 0)
    this.option('overbought_rsi_periods', 'number of periods for overbought RSI', Number, 25)
    this.option('overbought_rsi', 'sold when RSI exceeds this value', Number, 70)

    // ETHLERS_FT
    // this.option('period', 'period length, same as --period_length', String, '30m')
    // this.option('period_length', 'period length, same as --period', String, '30m')
    this.option('fish_pct_change', 'percent change of fisher transform for reversal', Number, 0)
    this.option('length', 'number of past periods to use including current', Number, 10)
    this.option('src', 'use period.close if not defined. can be hl2, hlc3, ohlc4, HAhlc3, HAohlc4', String, 'hl2')
    this.option('pos_length', 'check this number of previous periods have opposing pos value', Number, 1)

    // MOMENTUM
    // this.option('period', 'period length, same as --period_length', String, '1h')
    // this.option('period_length', 'period length, same as --period', String, '1h')
    this.option('momentum_size', 'number of periods to look back for momentum', Number, 5)

    // POSITION
    this.option('position_target_gain_percent', 'Target Sell Price above opening price', Number, 1.5)
    this.option('position_size_in_usd', 'period length, same as --period', Number, 100)
  },

  // On Engine Initialization
  onEngineInit: function (s) {
    s.strategy.positions = []
  },

  // Calculate Calculate Strategy Data
  calculate: function (s) {
    pivot.calculate(s)
    macd.calculate(s)
    ehlers_ft.calculate(s)
    momentum.calculate(s)
  },

  // THIS WORKS but not asynchronously
  // Get a Buy Size, overriding a percentage based buy
  // Return a size for the ASSET in the order:  Example, BTC coins:  0.123, not USD: $500
  // getBuySize: function (percent_size, price, s) {

  // Get a Buy Size, overriding a percentage based buy
  // Return a size for the ASSET in the order:  Example, BTC coins:  0.123, not USD: $500
  getBuySize: function (percent_size, price, s, cb) {

    // The Percentage based calculation is available for use as percent_size
    // console.log(percent_size)

    // tbw-positions has a configuration for how much USD to purchase with one position
    size = (1 / price) * s.options.position_size_in_usd
    cb(size)

  },

  // Get a Sell Size - This is used in computing an order size, as well as to create a sell quote, when calculations are occuring.
  // Return a size for the ASSET in the order:  Example, BTC coins:  0.123, not USD: $500
  getSellSize: function (percent_size, price, s, cb) {

    // The Percentage based calculation is available for use as percent_size
    // console.log(percent_size)



    // If there is an open position, get the open position size to sell.  Otherwise, allow the position size to deterine the right size
    if (s.strategy.positions.length > 0) {

      // Get the lowest open position by target price
      var lowestPositionTargetPrice = 99999999
      s.strategy.positions.forEach(position => {
        if (position._doc.target.price < lowestPositionTargetPrice) {
          lowestPositionTargetPrice = position._doc.open.size / position._doc.target.price
        }
      });

      size = lowestPositionTargetPrice
    } else {
      size = (1 / price) * s.options.position_size_in_usd
    }

    // Return the Sell size to quote
    cb(size)

  },

  // On Period Function - Produces Buy/Sell signals
  onPeriod: function (s, cb) {


    // Create Tally variables for Buy/Sell signals
    let totalBuy = 0
    let totalSell = 0

    //
    // Calculate OnPeriod updates - Ensure the lookback buffer if full to get the first one going
    //

    // Calculate Pivot
    if (s && s.lookback && s.lookback.constructor === Array && s.lookback.length > 5 && s.lookback[1].high && s.lookback[5].high) {
      pivot.onPeriod(s, function () { })
      if (s.signal == 'buy')
        totalBuy += 1
      if (s.signal == 'sell')
        totalSell += 1
    }

    // Calculate MACD
    macd.onPeriod(s, function () { })
    if (s.signal == 'buy')
      totalBuy += 1
    if (s.signal == 'sell')
      totalSell += 1

    // Calculate ehlers_ft
    ehlers_ft.onPeriod(s, function () { })
    if (s.signal == 'buy')
      totalBuy += 1
    if (s.signal == 'sell')
      totalSell += 1

    // Calculate Momentum
    momentum.onPeriod(s, function () { })
    if (s.signal == 'buy')
      totalBuy += 1
    if (s.signal == 'sell')
      totalSell += 1


    // Clear the Signal from the last Period Calculations
    s.signal = null

    // Calculate the Signal 
    if (totalBuy >= 2 && totalBuy >= totalSell && totalSell == 0)
      s.signal = 'buy'
    if (totalSell >= 2 && totalSell >= totalBuy && totalBuy == 0)
      s.signal = 'sell'

    // Stop Triggered for Buy
    if (s.signal == 'buy' && s.stopTriggered) {
      s.stopTriggered = false
    }

    // Stop Triggered for Sell
    if (s.signal == 'sell' && s.stopTriggered) {
      s.signal = null
    }

    // 
    // A Reliable Sell/Buy signal has been sent from Technical Analysis.
    // Use an analysis of the current open positions to determine what to do
    // 

    // First, test to see if the current trade prices satisfy any open positions:
    // Clear the sell signal and only set it if it should
    // s.signal = null

    // Prepare to match any overlaps in Position Size

    // Determine if a Position is ready to sell.
    // if (s.signal == 'sell') {

    // A Sell signal tells us it's a good time to sell, but make sure it's selling a profitable position
    // s.signal = null


    // Look to see if Any position has matured to the target price, overriding another signal.  This gives positions a chance to close at a period, if they have matured.
    if (s.strategy.positions.length > 0) {

      // Get the lowest open position by target price
      var lowestPositionTargetPrice = 99999999
      s.strategy.positions.forEach(position => {
        positionSellTarget = n(position._doc.target.price)
        if (positionSellTarget < lowestPositionTargetPrice) {
          lowestPositionTargetPrice = positionSellTarget
        }
      });

      // If the lowest Target Price of the open positions is above the Ask, mark as sell
      if (lowestPositionTargetPrice < s.quote.ask) {

        s.signal = 'sell'
      }

      // }
    }


    // // Evaluate opening a position with BUY
    if (s.signal == 'buy') {

      // Positions are worthless if they are too close together.
      // Positions should be at least half the percentage gain away from another position
      if (s.strategy.positions.length > 0) {

        // Determine what a suitable distance between open price amounts should be
        var priceBufferUnits = n(s.quote.ask).multiply(s.options.position_target_gain_percent / 100 / 2);

        // Prepare to match any overlaps in Position Size
        var overlap = false

        // Look to see if a position 'slot' is open (non overlapping with another position)
        s.strategy.positions.forEach(position => {


          var existingBufferLow = n(position._doc.open.price).subtract(priceBufferUnits)
          var existingBufferHigh = n(position._doc.open.price).add(priceBufferUnits);

          if (s.quote.ask < existingBufferHigh && s.quote.ask > existingBufferLow) {
            overlap = true
          }
        });

        // Test to see if an overlap was found
        if (overlap) {
          s.signal = null
        } else {
          s.signal = 'buy'
        }
      }

      // Deposit Balance must be greater than the desired position size
      if (s.signal == 'buy' && s.balance.depoist < s.options.position_size_in_usd) {
        s.signal = null
      }
    }

    // Return to the calling execution 
    cb();

  },

  // Handle Order Completion notifications
  orderExecuted: function (s, type, cb) {

    // Get the trade that just executed
    var my_trade = s.my_trades[s.my_trades.length - 1]

    async function refreshOpenPositions(s, cb) {

      // Find Lowest  Positiions:
      //  position.status = Open
      //  position.bot.mode = [sim | live | paper ]
      //  bot.selector Must match the current exchange/asset
      //  bot.strategy_session_id Must match the current session if running in Simulation

      // Define Query
      var query = {
        status: 'open',
        "bot.mode": s.options.mode,
        "bot.selector.normalized": s.options.selector.normalized
      }

      // Sort the Open Positions lowest 
      var sort = {
        'target.price': 1
      }

      // Only use positions from this Simulation
      if (s.options.mode == 'sim') {
        query['bot.session_id'] = strategy_session_id;
      }

      // Query and wait for the openPositions
      const openPositions = await Position.find(query).sort(sort).exec();
      s.strategy.positions = openPositions;

      console.log('Current Open Positions: ' + s.strategy.positions.length)

      // Return to the calling execution 
      cb();
    }
    async function closePosition(s, cb) {

      // Find Lowest  Positiions:
      //  position.status = Open
      //  position.bot.mode = [sim | live | paper ]
      //  bot.selector Must match the current exchange/asset
      //  bot.strategy_session_id Must match the current session if running in Simulation

      // Define Query
      var query = {
        status: 'open',
        "bot.mode": s.options.mode,
        "bot.selector.normalized": s.options.selector.normalized
      }

      // Sort the Open Positions lowest 
      var sort = {
        'target.price': 1
      }

      // Only use positions from this Simulation
      if (s.options.mode == 'sim') {
        query['bot.session_id'] = strategy_session_id;
      }

      // Query and wait for the openPositions
      const openPositions = await Position.find(query).sort(sort).exec();

      // Assess the Open positions
      if (openPositions.length > 0) {
        var lowestPosition = openPositions[0]

        // Calculate Position Target-Closing Details
        var position_close_usd = n(my_trade.size) * n(my_trade.price);
        var position_gain_usd = position_close_usd - lowestPosition.open.usd
        // var position_gain_percent = (position_gain_usd / lowestPosition.open.usd) * 100
        var position_time_open = my_trade.time - lowestPosition.open.timestamp

        // Closed Position Details
        lowestPosition.status = 'closed'
        lowestPosition.closed = {
          timestamp: my_trade.time,
          session_id: strategy_session_id,
          price: my_trade.price,
          usd: position_close_usd,
          execution_time: my_trade.execution_time,
          order_id: my_trade.order_id,
          order_type: my_trade.order_type,
          price: my_trade.price,
          size: my_trade.size,
          fee: my_trade.fee,
          slippage: my_trade.slippage,
          gain_usd: position_gain_usd,
          // gain_percent: position_gain_percent,
          time_open: position_time_open
        }



        // Update the Position to Closed.
        lowestPosition.save(function (err, position) {
          if (err) console.log(err);

          console.log('Sold a Position gaining ' + position.closed.gain_usd + ' USD')
          // console.log("Sold Position at : " + position.closed.price + ', for a gain of: ' + position.closed.gain_usd)  // + ' USD, Percenage above Buy: ' + position.closed.gain_percent + "%")

          // Return to the calling execution 
          refreshOpenPositions(s, function () {

            // Return to the execution thread.
            cb();
          })

        })
      } else {
        console.log('No positions are open this should not happen')
      }
    }

    // Open a Position when Buying
    if (type == 'buy') {

      // Calculate Position Target-Closing Details
      var target_profit_percent = 1 + (n(s.options.position_target_gain_percent) / 100)

      var opening_fee_usd = n(my_trade.price) * my_trade.fee
      var position_amount_usd = n(my_trade.size) * n(my_trade.price);
      // var position_investment_usd = opening_fee_usd + position_amount_usd;
      var target_close_at_usd = position_amount_usd * target_profit_percent;
      var target_close_at_price = n(my_trade.price) * target_profit_percent

      // Create a position record
      var position = new Position({

        // Bot Instance Details
        bot: {

          // Timestamps
          start_time: s.start,

          // Mode
          mode: s.options.mode,

          // Bot Strategy Session
          session_id: strategy_session_id,

          // Selector and Strategy
          selector: s.options.selector,
          strategy: s.options.strategy,

          // Conf
          conf: s.options.conf,
          options: s.options,
        },

        // Position Opening Event Details
        open: {
          timestamp: my_trade.time,
          execution_time: my_trade.execution_time,
          order_id: my_trade.order_id,
          order_type: my_trade.order_type,
          price: my_trade.price,
          size: my_trade.size,
          usd: position_amount_usd,
          fee: my_trade.fee,
          slippage: my_trade.slippage,
        },

        // Target Position Sell Details
        target: {
          price: target_close_at_price,
          usd: target_close_at_usd,
        },

        // Status and log
        status: 'open',
        // log: ['Position opened: ' + new Date() + ' at BTC-USD: ' + my_trade.price],
      });

      // Save the new Position
      position.save(function (err, position) {
        if (err) console.log(err);

        // Add the new position to the positions array
        s.strategy.positions.push(position);

        // Log the Position Bought
        // console.log("Bought Position at : " + position.open.price + ", Target Sell: " + position.target.price)
        // Refresh the Open Positions
        refreshOpenPositions(s, cb).catch(error => console.error(error))
      })
    }

    // Close the position
    if (type == 'sell') {

      // Run the Evaluation (Async but wait)
      closePosition(s, function () {

        // Refresh the Open Positions
        // refreshOpenPositions(s, cb).catch(error => console.error(error))

      })

    }

  },

  onReport: function (s) {
    var cols = []

    // var color = 'grey'
    // if (s.period.macd_histogram > 0) {
    //   color = 'green'
    // }
    // else if (s.period.macd_histogram < 0) {
    //   color = 'red'
    // }
    // cols.push('Open Positions: '[color])
    // cols.push(z(8, n(s.period.overbought_rsi).format('00'), ' ').cyan)

    return cols.concat(pivot.onReport(s), macd.onReport(s), ehlers_ft.onReport(s), momentum.onReport(s))
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 60, 'm'),
    min_periods: Phenotypes.Range(1, 200),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1, 20),
    sell_stop_pct: Phenotypes.RangeFloat(0.4, 0.6),
    profit_stop_enable_pct: Phenotypes.RangeFloat(0.5, 1),
    quarentine_time: Phenotypes.ListOption([240, 270, 300]),

    // macd
    ema_short_period: Phenotypes.Range(1, 20),
    ema_long_period: Phenotypes.Range(20, 100),
    signal_period: Phenotypes.Range(1, 20),
    up_trend_threshold: Phenotypes.Range(0, 50),
    down_trend_threshold: Phenotypes.Range(0, 50),
    overbought_rsi_periods: Phenotypes.Range(1, 50),
    overbought_rsi: Phenotypes.Range(20, 100),

    // ehlers_ft
    length: Phenotypes.Range(1, 30),
    fish_pct_change: Phenotypes.Range(-25, 75),
    pos_length: Phenotypes.Range(1, 6),
    src: Phenotypes.ListOption(['close', 'hl2', 'hlc3', 'ohlc4', 'HAhlc3', 'HAohlc4']),

    // momentum
    momentum_size: Phenotypes.Range(1, 20),

    // Positions
    position_target_gain_percent: Phenotypes.Range(1, 100),
    position_size_in_usd: Phenotypes.Range(50, 10000),

  }
}

