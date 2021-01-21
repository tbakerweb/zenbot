
// var async = require("async");
var pivot = require('../pivot/strategy')
var macd = require('../macd/strategy')
var ehlers_ft = require('../ehlers_ft/strategy')
var momentum = require('../momentum/strategy')
var crypto = require('crypto')
var Phenotypes = require('../../../lib/phenotype')
var n = require('numbro')
var _ = require('lodash')


// Create an ID for this Strategy Session
var strategy_session_id = crypto.randomBytes(4).toString('hex')

const mongoose = require('mongoose');
// const { null } = require('mathjs')
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
    usd_plus_fee: String,
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
  cb(openPositions);
}


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

    // TODO TODO TODO - This disables critical functionality I need to integrate here.  The current issue is that the ontrade (not on period) is where some of the trade signals come from.  This means that the code I've built into the onPeriod doesn't run here. 
    // I'm debugging the buy/sell signal over rides that positions require.  Don't allow the calculate to do anything but keep data fresh.
    // s.signal = null
  },

  // THIS WORKS but not asynchronously
  // Get a Buy Size, overriding a percentage based buy
  // Return a size for the ASSET in the order:  Example, BTC coins:  0.123, not USD: $500
  // getBuySize: function (percent_size, price, s) {

  // Get a Buy Size, overriding a percentage based buy
  // Return a size for the ASSET in the order:  Example, BTC coins:  0.123, not USD: $500
  getBuySize: function (percent_size, price, s, cb) {

    // The Percentage based calculation is available for use as percent_size
    // console.log(percent_size);

    // tbw-positions has a configuration for how much USD to purchase with one position
    size = n((1 / price) * s.options.position_size_in_usd).format(s.product.asset_increment ? s.product.asset_increment : '0.00000000')
    cb(size)

  },

  // Get a Sell Size - This is used in computing an order size, as well as to create a sell quote, when calculations are occuring.
  // Return a size for the ASSET in the order:  Example, BTC coins:  0.123, not USD: $500
  getSellSize: function (percent_size, price, s, cb) {

    // The Percentage based calculation is available for use as percent_size
    // console.log(percent_size);

    // If there is an open position, get the open position size to sell.  Otherwise, allow the position size to deterine the right size
    if (s.strategy.positions.length > 0) {

      // Get the lowest open position by target price
      var lowestPositionTargetPrice = n(99999999)
      var lowestPositionSize = n(99999999)
      // var periodHigh = n(s.lookback[0].high)
      var currentPrice = n(price)

      // Calculate the lowest Mature position
      s.strategy.positions.forEach(position => {
        var positionTargetPrice = n(position._doc.target.price)
        var positionOpenSize = n(position._doc.open.size)
        var positionTargetPrice = n(position._doc.target.price)

        // Determine if this position is lower than existing
        if (positionTargetPrice < lowestPositionTargetPrice) {

          // Update the State Variables to select the right position
          lowestPositionTargetPrice = positionTargetPrice
          lowestPositionSize = positionOpenSize
        }
      });

      // Cancel a Sell if none of the positions are mature
      if (lowestPositionTargetPrice._value < currentPrice._value) {
        if (lowestPositionSize.multiply(0.99)._value < n(s.balance.asset)._value) {
          size = lowestPositionSize.multiply(0.99).format(s.product.asset_increment ? s.product.asset_increment : '0.00000000')
        } else {
          size = null;
          s.signal = null;
        }
      } else {
        size = null;
        s.signal = null;
      }

    } else {
      size = 0.00000001
      // s.signal = null;
    }

    // Return the Sell size to quote
    cb(size)

  },

  // On Period Function - Produces Buy/Sell signals
  onPeriod: function (s, cb) {


    refreshOpenPositions(s, function (openPositions) {

      // s.strategy.positions = openPositions
      s.strategy.positions = _.sortBy(openPositions, [function (p) { return p.target.price }]).map(p => {
        if (p._doc.status == 'open') {
          return p
        }
      })
    });

    // console.log('refreshed positions: ' + s.strategy.positions.length)

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


    // // Evaluate opening a position with BUY
    if (s.signal == 'buy') {

      // Positions are worthless if they are too close together.
      // Positions should be at least half the percentage gain away from another position
      if (s.strategy.positions.length > 0) {

        // Determine what a suitable distance between open price amounts should be
        var period_close = n(s.lookback[0].close).value();
        var period_target_price = n(period_close).multiply(1 + (s.options.position_target_gain_percent / 100)).value();

        // Prepare to match any overlaps in Position Size
        var overlap = false

        // Look to see if a position 'slot' is open (non overlapping with another position)
        s.strategy.positions.forEach(position => {


          var existingBufferLow = n(position._doc.target.price).multiply(0.95).value();
          var existingBufferHigh = n(position._doc.target.price).multiply(1.05).value();

          if (existingBufferLow < period_target_price && period_target_price < existingBufferHigh) {
            overlap = true
          }
        });

        // Test to see if an overlap was found
        if (overlap) {
          // console.log('Strategy OnPeriod DISCARDING Buy Signal, Position Overlap based on Target Profits')
          s.signal = null
        } else {

          // console.log('Strategy OnPeriod Supports Buy Signal, it does NOT overlap with any of the existing ' + s.strategy.positions.length + ' positions.')
          s.signal = 'buy'
        }
      }

      // Deposit Balance must be greater than the desired position size
      if (s.signal == 'buy' && s.balance.currency < s.options.position_size_in_usd) {
        s.signal = null
      }
    }

    // Determine if a Position is ready to sell.
    if (s.signal == 'sell') {

      // Look to see if Any position has matured to the target price, overriding another signal.  This gives positions a chance to close at a period, if they have matured.
      if (s.strategy.positions.length > 0) {

        // Get the lowest open position by target price
        // var period_close = n(s.lookback[0].close).value();
        var period_low = n(s.lookback[0].low).value();
        // var period_high = n(s.lookback[0].high).value();

        // Calculate the lowest Position Target Price
        var lowestPositionTargetPrice = n(999999).value();

        s.strategy.positions.forEach(position => {
          var positionSellTarget = n(position._doc.target.price).value()
          if (positionSellTarget < lowestPositionTargetPrice) {
            lowestPositionTargetPrice = positionSellTarget
          }
        });

        // If the lowest Target Price of the open positions is above the Ask, mark as sell
        if (lowestPositionTargetPrice < period_low) {
          // console.log('Strategy OnPeriod Supports Sell Signal, an open position matures below the last Period High.')
          s.signal = 'sell'
        } else {
          s.signal = null
          // console.log('Strategy OnPeriod DISCARDING Sell Signal.  No positions are matured. Lowest: ' + lowestPositionTargetPrice + ", Ask: " + period_high + ', difference of ' + (period_high - lowestPositionTargetPrice))

        }
      }
    }

    if(s.signal){
      // console.log('SIGNAL: ' + s.signal)
    }
    cb();

  },

  // Handle Order Completion notifications
  orderExecuted: function (s, type, cb) {

    // Get the trade that just executed
    var my_trade = s.my_trades[s.my_trades.length - 1]


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
        var position_gain_usd = position_close_usd - lowestPosition._doc.open.usd
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


          refreshOpenPositions(s, function (openPositions) {

            s.strategy.positions = openPositions
            // s.strategy.positions = _.sortBy(s.strategy.positions, [function (p) { return p.target.price }]).map(p => {
            //   if (p._doc.status == 'open') {
            //     return p
            //   }
            // })
            var targetPositionPrices = _.sortBy(s.strategy.positions, [function (p) { return p.target.price }]).map(p => {
              // var targetPositionPrices = _.sortBy(openPositions, [function (p) { return p.target.price }]).map(p => {
              return p.target.price
            })

            console.log('')
            console.log("SOLD Position at: " + position.closed.price + ', Currency Gain: ' + position.closed.gain_usd)

            if (s.strategy.positions.length > 0) {
              console.log('Currently Open [' + s.strategy.positions.length + '] Lowest Position Target: ' + targetPositionPrices[0])
            } else {
              console.log('Currently Open [' + s.strategy.positions.length + ']')
            }

            cb();
          });

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
      var position_investment_usd = opening_fee_usd + position_amount_usd;
      var target_close_at_usd = s.options.position_amount_usd * target_profit_percent;
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
          usd_plus_fee: position_investment_usd,
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

        console.log('')
        console.log("Bought Position at: " + position.open.price + ", Target Sell: " + position.target.price)

        refreshOpenPositions(s, function (openPositions) {

          // Save th Open Positions from the DB
          s.strategy.positions = openPositions

          // Sort the Positions to get the lowest price
          // var targetPositionPrices = _.sortBy(s.strategy.positions, [function (p) { return p.target.price }]).map(p => {
          //   // var targetPositionPrices = _.sortBy(openPositions, [function (p) { return p.target.price }]).map(p => {
          //   return p.target.price
          // })

          // Log the Open Positions
          if (s.strategy.positions.length > 0) {
            console.log('Currently Open [' + s.strategy.positions.length + '] Lowest Position Target: ' + s.strategy.positions[0]._doc.target.price)
            // console.log('Currently Open [' + s.strategy.positions.length + '] Lowest Position Target: ' + targetPositionPrices[0])
          } else {
            console.log('Currently Open [' + s.strategy.positions.length + ']')
          }

          // Call Back to the caller
          cb();
        });
      })
    }

    // Close the position
    if (type == 'sell') {

      // Run the Close Position Function
      closePosition(s, cb);

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
    // period_length: Phenotypes.RangePeriod(1, 60, 'm'),
    // min_periods: Phenotypes.Range(1, 200),
    // markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    // markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    // order_type: Phenotypes.ListOption(['maker', 'taker']),
    // sell_stop_pct: Phenotypes.Range0(1, 50),
    // buy_stop_pct: Phenotypes.Range0(1, 50),
    // profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    // profit_stop_pct: Phenotypes.Range(1, 20),
    // sell_stop_pct: Phenotypes.RangeFloat(0.4, 0.6),
    // profit_stop_enable_pct: Phenotypes.RangeFloat(0.5, 1),
    // quarentine_time: Phenotypes.ListOption([240, 270, 300]),

    // // macd
    // ema_short_period: Phenotypes.Range(1, 20),
    // ema_long_period: Phenotypes.Range(20, 100),
    // signal_period: Phenotypes.Range(1, 20),
    // up_trend_threshold: Phenotypes.Range(0, 50),
    // down_trend_threshold: Phenotypes.Range(0, 50),
    // overbought_rsi_periods: Phenotypes.Range(1, 50),
    // overbought_rsi: Phenotypes.Range(20, 100),

    // // ehlers_ft
    // length: Phenotypes.Range(1, 30),
    // fish_pct_change: Phenotypes.Range(-25, 75),
    // pos_length: Phenotypes.Range(1, 6),
    // src: Phenotypes.ListOption(['close', 'hl2', 'hlc3', 'ohlc4', 'HAhlc3', 'HAohlc4']),

    // // momentum
    // momentum_size: Phenotypes.Range(1, 20),

    // Positions
    position_target_gain_percent: Phenotypes.Range(1, 100),
    position_size_in_usd: Phenotypes.Range(50, 500),

  }
}

