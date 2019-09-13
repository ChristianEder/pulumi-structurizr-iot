import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";
import { storeReceivedMessage } from "../../src/ingress/storeReceivedMessage";
import { Storage } from "./storage";
import * as architectureFlags from "../../architecture/architecture-flags";

export class Ingress {

    public iotHub: azure.iot.IoTHub;
    public ownerConnectionString: pulumi.Output<string>;
    public ownerSharedAccessPolicyKey: pulumi.Output<string>;

    constructor(resourceGroup: azure.core.ResourceGroup, storage: Storage, insights: azure.appinsights.Insights) {

        this.iotHub = this.createIoTHub(resourceGroup);

        if (architectureFlags.ingress === "Function") {
            this.iotHub.onEvent("telemetry", {
                resourceGroupName: resourceGroup.name,
                location: resourceGroup.location,
                account: storage.account,
                callback: storeReceivedMessage,
                outputs: [
                    storage.telemetry.output("telemetry"),
                    storage.devices.output("devices")
                ],
                appSettings: {
                    "APPINSIGHTS_INSTRUMENTATIONKEY": insights.instrumentationKey
                }
            });
        }

        this.ownerSharedAccessPolicyKey = this.iotHub.sharedAccessPolicies.apply(policies => policies.find(p => p.keyName === "iothubowner")!.primaryKey);
        this.ownerConnectionString = pulumi.interpolate`HostName=${this.iotHub.name}.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=${this.ownerSharedAccessPolicyKey}`;
    }

    private createIoTHub(resourceGroup: azure.core.ResourceGroup) {
        return new azure.iot.IoTHub("hub", {
            resourceGroupName: resourceGroup.name,
            sku: {
                capacity: 1,
                name: "B1",
                tier: "Basic",
            },
            fallbackRoute: {
                source: "DeviceMessages",
                enabled: true,
                endpointNames: ["events"],
                condition: "true",
            },
        });
    }
}

