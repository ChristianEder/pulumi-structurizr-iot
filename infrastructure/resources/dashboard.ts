import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";
import { signedBlobReadUrl } from "@pulumi/azure/storage";

import * as fs from "fs";
import * as path from "path";
import * as archiver from "archiver";

import { Api } from "./api";

export class Dashboard {

    public url: pulumi.Output<string>;

    constructor(resourceGroup: azure.core.ResourceGroup, storage: azure.storage.Account, api: Api) {

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

        var archive = pulumi.all([api.getDevicesUrl, api.getTelemetryUrl]).apply(async ([d, t]) => {
            var done = new Promise((resolve, reject) => {
                const output = fs.createWriteStream(path.resolve("./", "dest.zip"));
                const archive = archiver("zip");
              
                output.on("close", resolve);
                archive.on("error", reject);
              
                archive.pipe(output);
              
                archive.append("window.apiUrls = " + JSON.stringify({ getDevicesUrl: d,getTelemetryUrl: t }) + ";", { name: "urls.js" });
                archive.directory("../src/dashboard/dist", false);
                archive.finalize();
              });

              await done;
              return new pulumi.asset.FileArchive("dest.zip");
        });

        const blob = new azure.storage.ZipBlob(`dashboard`, {
            resourceGroupName: resourceGroup.name,
            storageAccountName: storage.name,
            storageContainerName: storageContainer.name,
            type: "block",
            content: archive
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

        this.url = app.defaultSiteHostname.apply(h => "https://" + h);
    }
}