import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure"
import { Storage } from "./storage";
import { getDevices } from "../../src/api/getDevices"
import { getTelemetry } from "../../src/api/getTelemetry"

export class Api {

    public getDevicesUrl: pulumi.Output<string>;
    public getTelemetryUrl: pulumi.Output<string>;

    constructor(private resourceGroup: azure.core.ResourceGroup, private storage: Storage, insights: azure.appinsights.Insights) {
        
        this.getDevicesUrl = this.createApiEndpoint(
            "api-get-devices",
            getDevices, 
            [storage.devices.input("devices")],
            insights)
            .url;
            
        this.getTelemetryUrl = this.createApiEndpoint(
            "api-get-telemetry", 
            getTelemetry,
            [
                storage.telemetry.input("telemetry", { filter: "(PartitionKey eq '{filter}')"  }),
                storage.aggregatedTelemetry.input("aggregatedTelemetry", { filter: "(PartitionKey eq '{filter}')"  })
            ],
            insights)
            .url;
    }

    createApiEndpoint(name: string, callback: any, inputs: azure.appservice.InputBindingSettings[], insights: azure.appinsights.Insights) {

        let args: azure.appservice.HttpEventSubscriptionArgs = {
            resourceGroup: this.resourceGroup,
            callback: callback,
            methods: ["GET"],
            account: this.storage.account,
            inputs: inputs,
            appSettings: {
                "APPINSIGHTS_INSTRUMENTATIONKEY": insights.instrumentationKey
            }
        };
        
        return new azure.appservice.HttpEventSubscription(name, args);
    }
}