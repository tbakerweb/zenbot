
## Parameter Bindings
[CmdletBinding()]
param (
    [Parameter()][String]$Exchange = 'binanceus',
    [Parameter()][String]$TradePair = 'BTC-USD',
    [Parameter()][String]$Stratagy, ## = 'tbw-positions',
    [Parameter()][Int]$Days = 5,
    [Parameter()][Int]$Generations = 1,
    [Parameter()][Int]$PopulationSize = 5,
    [Parameter()][Array]$Exchanges = @('gdax','binanceus','hbtc'),
    [Parameter()][Array]$TradePairs,
    [Parameter()][Array]$Stratagies,
    [Parameter()][Int]$MaxCores = 2,
    [Parameter()][Int]$CurrencyCapital = 500,
    [Parameter()][String]$PopulationName = 'tbw-positions',
    [Parameter()][Switch]$AllSelectors,
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
    ## Allow an override using -AllSelectors (Make sure to backfill first!)
    ## 
    if ($AllSelectors) {

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
    
        ## Create the 'Normalized' Selector 
        $Selector = $ExchangeName + '.' + $TradePairName

        ## 
        ## Allow an override using -AllStratagies
        ## 
        if ($AllStratagies) {
            $Stratagies = $StratagyNames 
        }


        ## Start loop for each Stratagy
        foreach ($StratagyName in $Stratagies) {
            
            ## Notify Selector Backfill starting
            Write-Host 'Starting Genetic Testing for for:'$StratagyName -ForegroundColor Green
            
            ## Create a unique Population Name for each test
            # $UniquePopulationName = $PopulationName + '-' + $StratagyName + '-' + $Timestamp
            $UniquePopulationName = $PopulationName + '-' + $StratagyName

            ## Run the Genetic Simulation
            $Filename = 'GeneSimResult-' + $StratagyName + '-' + $Selector + '-' + $Timestamp + '.html'
            node ./scripts/genetic_backtester/darwin.js --use_strategies $StratagyName --selector $Selector --population $PopulationSize --population_data $UniquePopulationName --days $Days --runGenerations $Generations --currency_capital $CurrencyCapital --maxCores $MaxCores --generateLaunch true --filename $Filename
        }
    }
}