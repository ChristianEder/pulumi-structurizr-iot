import * as azure from "@pulumi/azure";
import * as iot from "@pulumi/azure/iot";
import { storeReceivedMessage } from "../../src/ingress/storeReceivedMessage";
import { Storage } from "./storage";

export class Ingress {

    constructor(resourceGroup: azure.core.ResourceGroup, storage: Storage) {

        const iotHub = this.createIoTHub(resourceGroup);

        iotHub.onEvent("telemetry", {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            account: storage.account,
            callback: storeReceivedMessage,
            outputs: [
                storage.telemetry.output("telemetry"),
                storage.devices.output("devices")
            ]
        });
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

