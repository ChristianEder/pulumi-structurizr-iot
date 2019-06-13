import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure"
import { signedBlobReadUrl } from "@pulumi/azure/storage";

export class Dashboard {

    public url: pulumi.Output<string>;

    constructor(resourceGroup: azure.core.ResourceGroup, storage: azure.storage.Account) {

        const appServicePlan = new azure.appservice.Plan("dashboard", {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            kind: "App",
            sku: {
                tier: "Free",
                size: "F1",
            },
        });

        const storageContainer = new azure.storage.Container("dashboard", {
            resourceGroupName: resourceGroup.name,
            storageAccountName: storage.name,
            containerAccessType: "private",
        });

        const blob = new azure.storage.ZipBlob(`dashboard`, {
            resourceGroupName: resourceGroup.name,
            storageAccountName: storage.name,
            storageContainerName: storageContainer.name,
            type: "block",
            content: new pulumi.asset.FileArchive("../src/dashboard/dist/dashboard.zip")
        });

        const codeBlobUrl = signedBlobReadUrl(blob, storage);

        const app = new azure.appservice.AppService("dashboard", {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            appServicePlanId: appServicePlan.id,
            appSettings: {
                "WEBSITE_RUN_FROM_PACKAGE": codeBlobUrl,
            },
        });

        this.url = app.defaultSiteHostname;
    }
}