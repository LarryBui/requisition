$profile
#Install-Module SharePointPnPPowerShellOnline
get-command -Module *pnp*

#$configFilePath = "C:\VSRepositories\\requisition.json"
$webUrl = "https://xxx/sites/developers/requisition"
$listName = "Requisitions"

Connect-PnPOnline -Url $webUrl




new-pnplist -Title "Requisition Config" -Url RequisitionConfig -Template DocumentLibrary
$configFile = Add-PnPFile -Path $configFilePath  -Folder "RequisitionConfig"

New-PnPList -Title "Requisitions" -Template GenericList
Add-PnPField -List $listName -DisplayName "Office" -InternalName Office -Type Text
Add-PnPField -list $listName -DisplayName "Department" -InternalName Department -Type Text
Add-PnPField -list $listName -DisplayName "Type" -InternalName ReqType -Type Text
Add-PnPField -list $listName -DisplayName "Sub Type" -InternalName ReqSubType -Type Text














