var minimist = require('minimist')
  , n = require('numbro')
  // eslint-disable-next-line no-unused-vars
  , colors = require('colors')
  , moment = require('moment')
  , exchangeService = require('../lib/services/exchange-service')
  , { formatCurrency } = require('../lib/format')
  , collectionService = require('../lib/services/collection-service')
  , tb = require('timebucket')

module.exports = function (program, conf) {
  program
    .command('balance [selector]')
    .allowUnknownOption()
    .description('get asset and currency balance from the exchange')
    //.option('--all', 'output all balances')
    .option('-c, --calculate_currency <calculate_currency>', 'show the full balance in another currency')
    .option('--debug', 'output detailed debug info')
    .option('--json', 'return output as a json object')
    .action(function (selector, cmd) {

      if (selector !== undefined)
        conf.selector = selector

      var exchangeServiceInstance = exchangeService(conf)
      selector = exchangeServiceInstance.getSelector()

      var s = {
        options: minimist(process.argv),
        selector: selector,
        product_id: selector.product_id,
        asset: selector.asset,
        currency: selector.currency
      }

      var so = s.options
      delete so._

      Object.keys(conf).forEach(function (k) {
        if (typeof cmd[k] !== 'undefined') {
          so[k] = cmd[k]
        }
      })
      so.selector = s.selector
      so.debug = cmd.debug
      so.json = cmd.json
      so.mode = 'live'

      // Add the Mongo Collection Service
      var collectionServiceInstance = collectionService(conf)
      var balancesCollection = collectionServiceInstance.getBalances()

      function exit() {
        process.exit();
      }
      function balance() {
        var exchange = exchangeServiceInstance.getExchange()

        if (exchange === undefined) {
          console.error('\nSorry, couldn\'t find an exchange from selector [' + conf.selector + '].')
          process.exit(1)
        }

        exchange.getBalance(s, function (err, balance) {
          if (err) throw err
          exchange.getQuote(s, function (err, quote) {
            if (err) throw err

            // Get a Timebucket stamp
            let now = Date();
            var d = tb(now).resize(conf.balance_snapshot_period)

            // If JSON results are requested
            var json = {}
            // Create a result object for JSON
            var json = {
              id: so.selector.normalized + '-' + d.toString(),
              selector: so.selector.normalized,
              time: d.toMilliseconds(),
              currency: balance.currency,
              asset: balance.asset,
              price: quote.ask,
              consolidated: n(balance.asset).multiply(quote.ask).add(balance.currency).value()
            }

            // Clone the ID to Mongo's preferred _id
            json._id = json.id

            // If Calculating to another currency is requested
            if (so.calculate_currency) {
              exchange.getQuote({ 'product_id': s.asset + '-' + so.calculate_currency }, function (err, asset_quote) {
                if (err) throw err

                exchange.getQuote({ 'product_id': s.currency + '-' + so.calculate_currency }, function (err, currency_quote) {
                  if (err) throw err
                  var asset_total = balance.asset * asset_quote.bid
                  var currency_total = balance.currency * currency_quote.bid

                  // Return a JSON Object back, instead of printing 
                  if (so.json) {
                    json.asset_total = asset_total;
                    json.currency_total = currency_total;

                    console.log(JSON.stringify(json))
                  } else {
                    console.log((so.calculate_currency + ': ').grey + (asset_total + currency_total))
                  }
                  process.exit()
                })
              })
            }

            // Return the JSON Data
            if (so.json) {
              console.log(JSON.stringify(json))
            } else {
              // Not JSON output, write the formatted data to the CLI
              var bal = moment().format('YYYY-MM-DD HH:mm:ss').grey + ' ' + formatCurrency(quote.ask, s.currency, true, true, false) + ' ' + (s.product_id).grey + '\n'
              bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Asset: '.grey + n(balance.asset).format('0.00000000').white + ' Available: '.grey + n(balance.asset).subtract(balance.asset_hold).value().toString().yellow + '\n'
              bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Asset Value: '.grey + n(balance.asset).multiply(quote.ask).value().toString().white + '\n'
              bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Currency: '.grey + n(balance.currency).format('0.00000000').white + ' Available: '.grey + n(balance.currency).subtract(balance.currency_hold).value().toString().yellow + '\n'
              bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Total: '.grey + n(balance.asset).multiply(quote.ask).add(balance.currency).value().toString().white
              console.log(bal)
            }

            // Add the Balance to the Database, replacing a previous record, if one exists.
            balancesCollection.replaceOne({_id: json.id}, json, {upsert: true}, function (err, records) {
              if(err) throw err;
              process.exit();
            });
          })
        })
      }

      // Run the Get Balance
      balance()
    })
}

