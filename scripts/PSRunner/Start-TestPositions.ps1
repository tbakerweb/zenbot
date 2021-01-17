
## Parameter Bindings
[CmdletBinding()]
param (
    [Parameter()][String]$Exchange = 'binanceus',
    [Parameter()][String]$TradePair = 'BTC-USD',
    [Parameter()][String]$Stratagy = 'tbw-positions',
    [Parameter()][Int]$Days = 14
)

## Get Zenbot the Path
$Timestamp = Get-Date -Format FileDateTimeUniversal
$ScriptPath = Split-Path $MyInvocation.MyCommand.Path -Parent
$ZenbotPath = Join-Path $ScriptPath '..' '..'
$Selector = $Exchange + '.' + $TradePair
Set-Location $ZenbotPath

## List the Configuration Selections to sample
$PositionSizes = @(10, 25, 50, 100, 150, 200, 250, 300, 400)
$TargetGainPercents = @(0.1, 0.75, 1, 1.25, 1.5, 1.75, 2.0, 
    2.25, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0, 7.0, 
    8.0, 9.0, 10.12.5, 15, 17.5, 20)
$Periods = @('1m', '2m', '5m', '7m', '10m', '15m', '20m', '30m', '60m')

# Create a Key for each combination
$Configs = foreach ($Period in $Periods) {
    foreach ($TargetGainPercent in $TargetGainPercents) {
        foreach ($PositionSize in $PositionSizes) {
            "$Period-$TargetGainPercent-$PositionSize"
        }
    }
}

## Get a Random sample of Configuration Keys
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

## Iterate over the Sample Configurations
$Configs | ForEach-Object {
    
    ## Break apart the Key to the component Configurations
    $Period, $TargetGainPercent, $PositionSize = $_ -split '-'

    node ./zenbot sim $Selector --strategy $Stratagy --days $Days --start_capital 500 --period $Period --period_length $Period --position_target_gain_percent $TargetGainPercent --position_size_in_usd $PositionSize --silent $true
}



