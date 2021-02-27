
Import-Module mdbc

## Connect to the Mongo DB
Connect-Mdbc -ConnectionString 'mongodb+srv://lt-101.birdhouse.lan/zenbot4?retryWrites=true&w=majority' -NewCollection
$Database = Get-MdbcDatabase -Name 'zenbot4'

## Create Variables for the Mongo DB Collections
$SimResultCollection = Get-MdbcCollection -Database $Database -Name 'sim_results'


$SimResults = Get-MdbcData `
    -Collection $SimResultCollection `
    -Filter @{ strategy = 'tbw-positions'} -first 100