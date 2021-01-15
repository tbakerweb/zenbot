
## Parameter Bindings
[CmdletBinding()]
param (
    [Parameter()][String]$Exchange, ##= 'binanceus',
    [Parameter()][String]$TradePair, ## = 'BTC-USD',
    [Parameter()][String]$Stratagy, ## = 'tbw-positions',
    [Parameter()][Int]$Days = 5,
    [Parameter()][Int]$Generations = 1,
    [Parameter()][Int]$PopulationSize = 5,
    [Parameter()][Array]$Exchanges = @('gdax', 'binanceus', 'hbtc'),
    [Parameter()][Array]$TradePairs,
    [Parameter()][Array]$Stratagies,
    [Parameter()][Int]$MaxCores = 2,
    [Parameter()][Int]$CurrencyCapital = 500,
    [Parameter()][String]$PopulationName = 'tbw-positions',
    [Parameter()][Switch]$AllTradePairs,
    [Parameter()][Switch]$AllStratagies
)

## Get Zenbot the Path
$ScriptPath = Split-Path $MyInvocation.MyCommand.Path -Parent
$ZenbotPath = Join-Path $ScriptPath '..' '..'
$ExchangesPath = Join-Path $ZenbotPath 'extensions' 'exchanges'
$StratagiesPath = Join-Path $ZenbotPath 'extensions' 'strategies'

Set-Location $ZenbotPath
## Pluralize Single Parameters to Arrays to enable nested looping logic
if (-Not $Exchanges) { $Exchanges = [Array]@($Exchange) }
if (-Not $TradePairs) { $TradePairs = [Array]@($TradePair) }
if (-Not $Stratagies) { $Stratagies = [Array]@($Stratagy) }

## Set Default Values (instead of params defaults, these use the passed in string as an override)
$Timestamp = Get-Date -Format FileDateTimeUniversal

## Collect Important Objects
$ExchangeNames = (Get-ChildItem -Path $ExchangesPath -Directory).Name | Where-Object { $_ -ne 'sim' }
$StratagyNames = (Get-ChildItem -Path $StratagiesPath -Directory).Name

<#
##  Begin processing the nested loops
##
    Exchanges
        TradePairs
            Stratagy

#>

## For Each Exchange
ForEach ($ExchangeName in $Exchanges) {
    
    ## Validate the Exchange Name
    if (-not ($ExchangeNames -contains $ExchangeName)) {
        Write-Host "Exchange is invalid:"$ExchangeName -ForegroundColor Red
        Continue
    }

    ## 
    ## Allow an override using -AllTradePairs (Make sure to backfill first!)
    ## 
    if ($AllTradePairs) {

        ## Reset TradePairs so it can be filled by the list of exchange products
        $TradePairs = [System.Collections.ArrayList]@()
        
        ## Read what products the exchange offers
        $Path = Join-Path $ExchangesPath $ExchangeName 'products.json'
        $ExchangeProductsValues = Get-Content -Path $Path | ConvertFrom-Json
        
        foreach ($ExchangeProductValue in $ExchangeProductsValues) {
            $Asset = $ExchangeProductValue.asset
            $Currency = $ExchangeProductValue.currency
            $TradePairs.Add("$Asset-$Currency") | Out-Null
        }
    }


    ## For Each Trading Pair (Creating a Selector)
    ForEach ($TradePairName in $TradePairs) {
    
        ## Notify Selector Backfill starting
        Write-Host 'Getting Balance for:'$TradePairName -ForegroundColor Green
        
        ## Create the 'Normalized' Selector 
        $Selector = $ExchangeName + '.' + $TradePairName

        node ./zenbot.js balance $Selector --debug --conf tbw-local-binanceus-multi-BTC-TEST.js
    }
}