
## Update the Title Bar
$Date = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssfffffffZ")

## Setup an Options Object
$Options = @{
    Zenbot     = ''
    Stratagies = @()
    Exchanges  = [PSCustomObject]@{}
}

## Set Important Paths
$ZenbotPath = "C:\Src\toastedCoder\zenbot"
$ExchangesPath = "C:\Src\toastedCoder\zenbot\extensions\exchanges"
$StratagiesPath = "C:\Src\toastedCoder\zenbot\extensions\strategies"

## Collect Important Objects
$Options.Stratagies = (Get-ChildItem -Path $StratagiesPath -Directory).Name
$Exchanges = (Get-ChildItem -Path $ExchangesPath -Directory).Name | Where-Object { $_ -ne 'sim' }

## Add to the list of Selectors
ForEach ($Exchange in $Exchanges) {
    
    ## Get the Exchange Products
    $Path = Join-Path $ZenbotPath 'extensions' 'exchanges' $Exchange 'products.json'
    $ExchangeProducts = Get-Content -Path $Path | ConvertFrom-Json
    
    $Products = [System.Collections.ArrayList]@()
    
    ## Return Each exchange.ASSET-CURRENCY
    foreach ($ExchangeProduct in $ExchangeProducts) {
        $e = $Exchange.toLower()
        $pa = $ExchangeProduct.asset
        $pc = $ExchangeProduct.currency
        $Products.Add("$e.$pa-$pc") | Out-Null
    }

    ## Add the OptionExchange to the Options Object
    $Options.Exchanges | Add-Member -NotePropertyName $Exchange -NotePropertyValue $Products
}


Set-Location $ZenbotPath

## Run a backfill for each coin
# $BotJobs = $Options.Exchanges.binanceus | Start-RSJob -Throttle 5 -ScriptBlock {
$Options.Exchanges.binanceus | ForEach-Object {
    
    # Construct an bot backfill
    $selector = $_
    node ./zenbot.js sim $selector --conf tbw-sim.json --days 14 --asset_capital 500 --silent

}

## Get the number of jobs for reporting
# $BotCount = $BotJobs.Count

$Complete = $False
While (-Not $Complete) {

    ## Sort Jobs
    # $CompleteJobs = Get-RSJob | Where-Object { $_.State -eq 'Completed' }
    # $RunningJobs = Get-RSJob | Where-Object { $_.State -eq 'Running' }
    # $Jobs = Get-RSJob | Where-Object {$_.State -eq 'Running'}

    # ## Running Jobs
    # Write-Host 'Getting Running Jobs' -ForegroundColor Yellow
    # Get-RSJob | Where-Object { $_.State -eq 'Running' } | Receive-RSJob

    ## Display Remaining Jobs
    Write-Host ("Remaining Jobs:" + $BotJobs.Count) -ForegroundColor Green
    Get-RSJob | Receive-RSJob -ErrorAction SilentlyContinue

    ## Remove Completed Jobs
    # Write-Host 'Getting Completd Jobs' -ForegroundColor Green
    Get-RSJob | Where-Object { $_.State -eq 'Completed' } | Remove-RSJob
    
    


    ## Complete or Sleep
    if ($BotJobs.Count -eq 0) {
        $Complete = $true

    } else {
        Start-Sleep -Seconds 5
    }
}
Write-Host 'DONE' -ForegroundColor Green -BackgroundColor Blue
