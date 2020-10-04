
$Bots = @(
    '.\zenbot.bat trade --conf tbw-local-binanceus-trend_ema-BTC.json',
    '.\zenbot.bat trade --conf tbw-local-binanceus-trend_ema-ETH.json',
    '.\zenbot.bat trade --conf tbw-local-binanceus-trend_ema-XRP.json',
    '.\zenbot.bat trade --conf tbw-local-binanceus-trend_ema-LTC.json',
    '.\zenbot.bat trade --conf tbw-local-binanceus-trend_ema-ONE.json'
)

Import-Module PoshRSJob

$BotJobs = $Bots | Start-RSJob {
    Set-Location -Path 'C:\Src\toastedCoder\zenbot'
    &$_
}

