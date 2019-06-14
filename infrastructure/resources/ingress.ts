import * as azure from "@pulumi/azure";
import * as iot from "@pulumi/azure/iot";
import { storeReceivedMessage } from "../../src/ingress/storeReceivedMessage";

export class Ingress {

    constructor(resourceGroup: azure.core.ResourceGroup, storage: azure.storage.Account) {

        const iotHub = this.createIoTHub(resourceGroup);

        let args: iot.IoTHubSubscriptionArgs = {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            account: storage,
            callback: storeReceivedMessage
        }

        args = storage.bindTableOutput(args, "telemetry", "Telemetry");
        args = storage.bindTableOutput(args, "devices", "Devices");

        iotHub.onEvent("telemetry", args);
    }



    private createIoTHub(resourceGroup: azure.core.ResourceGroup) {
        return new iot.IoTHub("hub", {
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

