<#
	This script is intented to update MongoDB tables associated with ZenbotThings 
	Each Exchange and Strategy should be recorded into a separate collection entry

#>

## Import the Mdbc Module
Import-Module Mdbc

## Define Conenction Details
$ExchangesCollectionParams = @{
	ConnectionString = 'mongodb://192.168.1.5'
	DatabaseName     = 'zenbot4'
	CollectionName   = 'exchanges'

}
Connect-Mdbc @ExchangesCollectionParams

## Connect to the Exchanges and Products Collections
$ExchangesCollection = Get-MdbcCollection -Name 'exchanges'
$ExchangeProductsCollection = Get-MdbcCollection -Name 'exchange_products'


## Iterate over each exchange name provided
$ExchangeFolders = Get-ChildItem -Path 'C:\Src\toastedCoder\zenbot\extensions\exchanges' -Directory | Select-Object -ExpandProperty NameString


## Iterate through each exchage to get it's products
foreach ($Exchange in $ExchangeFolders) {
	
	## Add the exchage
	# $Exchage | Add-MdbcData -Collection $ExchangesCollection

	## Read Each of the Exchage Products from the Products.json file
	$ExchangeProducts = Get-ChildItem -Path (Join-Path 'C:\Src\toastedCoder\zenbot\extensions\exchanges\'  $Exchange 'products.json') | Get-Content | ConvertFrom-Json

	## Iterate over the products this exchange offers
	foreach ($ExchangeProduct in $ExchangeProducts) {
		
		## Create the Selelector format
		$Selector = ($Exchange + '.' + $ExchangeProduct.asset + '-' + $ExchangeProduct.currency)

		## Add the Selector as the Object's ID field
		$ExchangeProduct | Add-Member -NotePropertyName '_id' -NotePropertyValue $Selector

		$ExchangeProduct | Add-MdbcData -Collection $ExchangeProductsCollection

	}
	

	

}

