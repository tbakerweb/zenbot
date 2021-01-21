
## Parameter Bindings
[CmdletBinding()]
param (
    [Parameter()][String]$Exchange = 'binanceus',
    [Parameter()][String]$TradePair = 'BTC-USD',
    [Parameter()][String]$Stratagy = 'tbw-positions',
    [Parameter()][Int]$Days = 30
)

## Get Zenbot the Path
$Timestamp = Get-Date -Format FileDateTimeUniversal
$ScriptPath = Split-Path $MyInvocation.MyCommand.Path -Parent
$ZenbotPath = Join-Path $ScriptPath '..' '..'
$Selector = $Exchange + '.' + $TradePair
Set-Location $ZenbotPath

## List the Configuration Selections to sample
# $TargetGainPercents = @( 20, 40, 50, 75)
# $PositionSizes = @(10, 25, 50, 100, 150, 200, 250, 300, 400)
$PositionSizes = @(100, 150, 200, 250)
# $Periods = @('1m', '2m', '5m', '7m', '10m', '15m', '20m', '30m', '60m')
$Periods = @('7m', '10m')
# $TargetGainPercents = @(0.1, 0.75, 1, 1.25, 1.5, 1.75, 2.0, 
#     2.25, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0, 7.0, 
#     8.0, 9.0, 10.12.5, 15, 17.5, 20, 40, 50, 75)
$TargetGainPercents = @( 5.0, 6.0, 7.0, 8.0, 9.0, 10.12.5, 15)

# Create a Key for each combination
$Configs = foreach ($Period in $Periods) {
    foreach ($TargetGainPercent in $TargetGainPercents) {
        foreach ($PositionSize in $PositionSizes) {
            "$Period-$TargetGainPercent-$PositionSize"
        }
    }
}

## Get a Random sample of Configuration Keys
# $Configs = $Configs | Sort-Object { Get-Random } | Select-Object -First 100
$Configs = $Configs | Sort-Object { Get-Random } 


#Results JSON and File Path
$Results = [PSCustomObject]@{
    Metadata = [PSCustomObject]@{
        Tony          = 'Loves Robin'
        Timestamp     = $Timestamp
        ConfigSamples = $ConfigSamples
    }
    Results  = @()
}
$ResultFile = "C:\Src\toastedCoder\CryptoCurrency\Zenbot Data\TestingPositions_$Timestamp.json"

## Write the Initial File
$Results | ConvertTo-Json -Depth 100 | Set-Content -Path $ResultFile -Force


## Establish Counters
$Total = $Configs.Count
$Count = 1

## Iterate over the Sample Configurations
$Configs | ForEach-Object {
    
    ## Break apart the Key to the component Configurations
    $Period, $TargetGainPercent, $PositionSize = $_ -split '-'

    Write-Host "Config: $Count of $Total " -NoNewline
    Write-Host "Testing Period: " -NoNewline
    Write-Host $Period -ForegroundColor Yellow -NoNewline
    Write-Host "  Gain Percent: " -NoNewline
    Write-Host $TargetGainPercent -ForegroundColor Yellow -NoNewline
    Write-Host "  Position Size: " -NoNewline
    Write-Host $PositionSize -ForegroundColor Yellow
    
    ## Run the Simulation
    node ./zenbot sim $Selector --strategy $Stratagy --days $Days --start_capital 650 --period $Period --period_length $Period --position_target_gain_percent $TargetGainPercent --position_size_in_usd $PositionSize

    ## Increase the Counter
    $Count++

}



