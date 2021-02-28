
## Parameter Bindings
[CmdletBinding()]
param (
    [Parameter()][String]$Exchange = 'binanceus',
    [Parameter()][String]$TradePair = 'BTC-USD',
    [Parameter()][Array]$Exchanges,
    [Parameter()][Array]$TradePairs,
    [Parameter()][Switch]$AllTradePairs,
    [Parameter()][Switch]$JSON
)

## Get Zenbot the Path
$ScriptPath = Split-Path $MyInvocation.MyCommand.Path -Parent
$ZenbotPath = (Get-Item $ScriptPath).Parent.Parent
$ExchangesPath = Join-Path $ZenbotPath 'extensions' 'exchanges'

Set-Location $ZenbotPath
## Pluralize Single Parameters to Arrays to enable nested looping logic
if (-Not $Exchanges) { $Exchanges = [Array]@($Exchange) }
if (-Not $TradePairs) { $TradePairs = [Array]@($TradePair) }

## Collect Important Objects
$ExchangeNames = (Get-ChildItem -Path $ExchangesPath -Directory).Name | Where-Object { $_ -ne 'sim' }

<#
##  Begin processing the nested loops
##
    Exchanges
        TradePairs

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
    if ($AllTradePairs) {

        ## Reset TradePairs so it can be filled by the list of exchange products
        # $TradePairs = [System.Collections.ArrayList]@()
        
        ## Read what products the exchange offers
        $Path = Join-Path $ExchangesPath $ExchangeName 'products.json'
        $ExchangeProductsValues = Get-Content -Path $Path | ConvertFrom-Json
        
        $TradePairs = foreach ($ExchangeProductValue in $ExchangeProductsValues) {
            $Asset = $ExchangeProductValue.asset
            $Currency = $ExchangeProductValue.currency
            # $TradePairs.Add("$Asset-$Currency") | Out-Null
            "$Asset-$Currency"
        }
    }


    ## For Each Trading Pair (Creating a Selector)
    ForEach ($TradePairName in $TradePairs) {
    
        ## Create the 'Normalized' Selector 
        $Selector = $ExchangeName + '.' + $TradePairName
        Write-Host 'Getting Balance for: ' -NoNewline
        Write-Host $Selector -ForegroundColor Cyan

        if($JSON){
            node ./zenbot.js balance $Selector --json true
        } else {
            node ./zenbot.js balance $Selector
        }

        Write-Host ''
    }
}




