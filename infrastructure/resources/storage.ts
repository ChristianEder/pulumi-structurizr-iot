import * as azure from "@pulumi/azure"

export class Storage {

    public account: azure.storage.Account;
    public telemetry: azure.storage.Table;
    public devices: azure.storage.Table;

    constructor(resourceGroup: azure.core.ResourceGroup) {

        this.account = new azure.storage.Account("storage", {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            accountTier: "Standard",
            accountReplicationType: "LRS",
        });

        this.telemetry = new azure.storage.Table("Telemetry", { resourceGroupName: resourceGroup.name, storageAccountName: this.account.name });
        this.devices = new azure.storage.Table("Devices", { resourceGroupName: resourceGroup.name, storageAccountName: this.account.name });
    }
}