
## Parameter Bindings
[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)][ValidateSet('Backfill', 'Sim', 'StratagySim', 'Trade', 'Monitor', 'GeneTesting')][String]$Mode,
    [Parameter()][Switch]$Monitor,
    [Parameter()][Int]$Days = 14,
    [Parameter()][String]$Exchange,
    [Parameter()][String]$TradeConfigs,
    [Parameter()][String]$GeneStratagy,
    [Parameter()][String]$ZenbotPath = "C:\Src\toastedCoder\zenbot",
    [Parameter()][String]$Throttle = 6
)
    
## Static Configuration Settings
$Config = [pscustomObject] @{
    
    ## Static Options
    Timestamp       = (Get-Date -Format FileDateTimeUniversal)
    Mode            = $Mode
    ZenbotPath      = $ZenbotPath 
    
    ## Exchange and Product Selections
    Exchange        = if ($Exchange) { $Exchange } else { 'binanceus' }
    DefaultSelector = 'binanceus.BTC-USD'
    BaseConfig      = 'tbw-sim.json'
    
    ## Trading Configuration
    TradeConfigs    = if ($TradeConfigs) { $TradeConfigs } else { @(
            'tbw-local-binanceus-trend_ema-BTC.json',
            'tbw-local-binanceus-trend_ema-ETH.json',
            'tbw-local-binanceus-trend_ema-LINK.json',
            'tbw-local-binanceus-trend_ema-ONE.json',
            'tbw-local-binanceus-trend_ema-UNI.json',
            'tbw-local-binanceus-trend_ema-XRP.json',
            'tbw-local-binanceus-trend_ema-ZEC.json'
        )
    }
    
    ## MOVED to Start-GeneticSimulations.ps1
    ## Genetic Backtest Configs
    # GeneTesting     = [pscustomObject]@{
    #     <#
    #     # Stratagies
    #         'all' 
    #         'bollinger'
    #         'macd'
    #         'trend_bollinger'
    #         'trend_ema'
    #         'speed'
    #     #>
    #     Stratagy        = 'speed'
    #     PopulationSize  = 10
    #     Generations     = 2
    #     CurrencyCapital = 500
    #     PopulationName  = '2020-11-04-tbw-testing'
    # }


    ## Backfill and Sim, Gene Testing Options
    Days            = $Days

    ## Runspace Options
    Throttle        = $Throttle
}


## Resolve Important Paths
$ExchangesPath = Join-Path $ZenbotPath 'extensions' 'exchanges'
$StratagiesPath = Join-Path $ZenbotPath 'extensions' 'strategies'

## Enumerate Stratagies and Exchanges (key, value = currency pairs)
$ExchangeSelectors = [PSCustomObject] @{}

## Collect Important Objects
$ExchangeNames = (Get-ChildItem -Path $ExchangesPath -Directory).Name | Where-Object { $_ -ne 'sim' }
$Stratagies = (Get-ChildItem -Path $StratagiesPath -Directory).Name

## Add to the list of Selectors
ForEach ($ExchangeName in $Config.Exchange) {
    
    ## Validate the Exchange Name
    if (-not ($ExchangeNames -contains $ExchangeName)) {
        throw ("Exchange is invalid: " + $ExchangeName)
    }

    ## Get the Exchange Products
    $Path = Join-Path $ExchangesPath $ExchangeName 'products.json'
    $ExchangeProductsValues = Get-Content -Path $Path | ConvertFrom-Json
    
    $Selectors = [System.Collections.ArrayList]@()
    
    ## Return Each exchange.ASSET-CURRENCY
    foreach ($ExchangeProductValue in $ExchangeProductsValues) {
        $e = $ExchangeName.toLower()
        $pa = $ExchangeProductValue.asset
        $pc = $ExchangeProductValue.currency
        $Selectors.Add("$e.$pa-$pc") | Out-Null
    }

    ## Add the OptionExchange to the Options Object
    $ExchangeSelectors | Add-Member -NotePropertyName $ExchangeName -NotePropertyValue $Selectors -Force
}

## USD Pairs from the 
$ExchangePairs = $ExchangeSelectors | Select-Object -ExpandProperty $Config.Exchange | Where-Object { $_ -like "*-USD" }

## Backfill
if ($Config.Mode -eq 'Backfill') {


    ## For Each Exchange Pair
    $JobNamePrefix = 'B-' + $Config.Exchange + '-'
    # $ExchangePairs | ForEach-Object -Process {
    $ExchangePairs | Start-RSJob -Name { $JobNamePrefix + $_ } -ArgumentList $Config -Throttle $Throttle -ScriptBlock {
        param ($Config)
        
        #Set the Location
        Set-Location $Config.ZenbotPath

        ## Set the Selector from the Each Loop
        $Selector = $_

        ## Notify Selector Backfill starting
        Write-Host "Running Backfill for: $Selector"
        
        ## Run the Backfill  (Ultimately to Out-Null to keep the process open)
        node ./zenbot.js backfill $Selector --days $Config.Days --conf $Config.BaseConfig | Tee-Object -Variable BackfillOutput
        return $BackfillOutput
        
       
    } | Out-Null
}

## Run Simulations
if ($Mode -eq 'Sim') {


    ## For Each Exchange Pair
    $JobNamePrefix = 'S-' + $Config.Exchange + '-'
    $ExchangePairs | ForEach-Object -Process {
        # $ExchangePairs | Start-RSJob -Name { $JobNamePrefix + $_ } -ArgumentList $Config -Throttle $Throttle -ScriptBlock {
        # param ($Config)
        
        #Set the Location
        Set-Location $Config.ZenbotPath

        ## Set the Selector from the Each Loop
        $Selector = $_

        ("Selector: " + $Selector)
        
        Write-Host "Selector: " -NoNewline
        Write-Host $Selector -ForegroundColor Green
    
        ## Notify Selector Simulation starting
        Write-Host "Running Simulation for: " -NoNewline
        Write-Host $Selector -ForegroundColor Green
        
        ## Set File Paths
        $FolderPath = Join-Path $Config.ZenbotPath 'simulations' $Config.Timestamp
        # $Filename = $Selector + '.html'
        # $FilePath = Join-Path $FolderPath $Filename

        Test-FolderPath -FolderPath $FolderPath
        
        ## Run the Simulation
        # node ./zenbot.js sim $Selector --conf $Config.BaseConfig --days $Config.Days --asset_capital 500 --start_capital 500 --filename $FilePath --silent | Tee-Object -Variable SimulationOutput | Out-Null
        # node ./zenbot.js sim $Selector --conf $Config.BaseConfig --days $Config.Days --start_capital 500 --filename $FilePath --enable_stats | Tee-Object -Variable SimulationOutput | Out-Null
        # node ./zenbot.js sim $Selector --conf $Config.BaseConfig --days $Config.Days --start_capital 500 | Tee-Object -Variable SimulationOutput | Out-Null
        # return $SimulationOutput
        
        node ./zenbot.js sim $Selector --conf $Config.BaseConfig --days $Config.Days --start_capital 500
       
    } | Out-Null
}

# Run Simulations Bots for the config, using each of the stratagies
if ($Config.Mode -like 'StratagySim') {
    
        
    ## Run a Simulation for each USD Pair
    ## For Each Exchange Pair
    # $ExchangePairs | ForEach-Object -Process {
    $Stratagies | Start-RSJob -Name $_ -ArgumentList $Config -ScriptBlock {
        param ($Config)
        
        ## Get the Stratagy Name
        $Stratagy = $_

        #Set the Location
        Set-Location $Config.ZenbotPath
        
        ## Set File Paths
        $FolderPath = Join-Path $Config.ZenbotPath 'simulations' $Config.Timestamp
        $Filename = $Stratagy + '-' + $Config.DefaultSelector + '.html'
            
        Test-FolderPath -FolderPath $FolderPath
        $FilePath = Join-Path $FolderPath $Filename
            
        ## Run the Simulation In Runspace mode
        node ./zenbot.js sim $Config.DefaultSelector --conf $Config.BaseConfig --stratagy $Stratagy --days $Config.Days --asset_capital 500 --start_capital 500 --filename $FilePath | Tee-Object -Variable StratagySimOutput | Out-Null
        return $StratagySimOutput
            
        ## Run the Simulation in Loop Mode
        # . node ./zenbot.js sim $Selector --conf $Config.Config --stratagy $Stratagy --days $Config.Days --start_capital 500 --filename $FilePath
            
    } | Out-Null
    
}

## Run Trade Bots
if ($Mode -eq 'Trade') {
    
    ## Each Active Trade Config
    ## For Each Exchange Pair
    $JobNamePrefix = 'T-' + $Config.Exchange + '-'
    $Config.TradeConfigs | Start-RSJob -Name { $JobNamePrefix + $_ } -ArgumentList $Config -Throttle $Throttle -ScriptBlock {
        param($Config)

        Set-Location $Config.ZenbotPath

        # The Input is a Config.json file
        $ConfigFile = $_

        ## Notify Selector Backfill starting
        Write-Host "Starting (LIVE) Trade Bot for: $ConfigFile " -NoNewline
    
        ## Run the Trade Bot
        node ./zenbot.js trade --conf $ConfigFile --non_interactive *>&1
        # return $TradeOutput
    } | Out-Null
}

##
## MOVED to Start-GeneticSimulations.ps1
##
# ## Genetic Testing
# if ($Mode -eq 'GeneTesting') {
    
#     ## Set Folder Path
#     Set-Location $Config.ZenbotPath

#     ## Notify Selector Backfill starting
#     Write-Host 'Starting Genetic Testing for for:'$Config.GeneTesting.Stratagy -NoNewline
    
#     ## Run the Trade Bot
#     $PopulationName = $Config.GeneTesting.Stratagy + '-' + $Config.GeneTesting.PopulationName
#     $Filename = 'GeneSimResult-' + $Config.GeneTesting.Stratagy + '-' + $Config.DefaultSelector + '-' + (Get-Date -Format FileDateTimeUniversal) + '.html'
#     node ./scripts/genetic_backtester/darwin.js --use_strategies $Config.GeneTesting.Stratagy --selector $Config.DefaultSelector --population $Config.GeneTesting.PopulationSize --population_data $PopulationName --days $Config.Days --runGenerations $Config.GeneTesting.Generations --currency_capital $Config.GeneTesting.CurrencyCapital --maxCores $Config.Throttle --generateLaunch true --filename $Filename
#     # node ./scripts/genetic_backtester/darwin.js --use_strategies ($Config.GeneTesting.Stratagies -join ',') --selector $Config.DefaultSelector --population $Config.GeneTesting.PopulationSize --population_data $Config.GeneTesting.PopulationName --days $Config.Days --runGenerations $Config.GeneTesting.Generations --currency_capital $Config.GeneTesting.CurrencyCapital --maxCores $Config.Throttle --generateLaunch true --filename $Filename
# }

## Monitor the Runspaces
if ($Monitor -or ($Config.Mode = 'Monitor')) {

    ## Get the jobs and loop over them
    $Jobs = Get-RSJob
    While ($Jobs.Count -ne 0) {
        
        ## Clear the host to make the update cleaner
        # Clear-Host
        
        ## Report total jobs
        Write-Host 'Total Jobs in Queue:'$Jobs.Count -ForegroundColor Green
        
        ## Sleep so the update is not Jarring
        Start-Sleep -Seconds 1

        ## Get Remaining Jobs
        $Jobs = Get-RSJob
    
        ## Receive Console output
        foreach ($Job in $Jobs) {
            
            # Receive the console output of the job
            # $Job | Receive-RSJob
            
            
            # # Write the information stream again to clear it
            # $Job.InnerJob.Streams.Information | ForEach-Object {
            #     Write-Host $_
            # }
            $Job.InnerJob.Streams.ClearStreams()
        }
    
        ## Remove Completed Jobs
        $Jobs | Where-Object { $_.State -in @('Completed', 'Failed') } | Remove-RSJob
    
        ## Sleep so some work can get done
        # Start-Sleep -Seconds 2
        Start-Sleep -Milliseconds (250..815 | Get-Random)
    }
}
