import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure"
import { HttpRequest } from "@pulumi/azure/appservice";
import { getDevices } from "../../src/api/getDevices"
import { getTelemetry } from "../../src/api/getTelemetry"

export class Api {

    public getDevicesUrl: pulumi.Output<string>;
    public getTelemetryUrl: pulumi.Output<string>;

    constructor(private resourceGroup: azure.core.ResourceGroup, private storage: azure.storage.Account) {
        
        this.getDevicesUrl = this.createApiEndpoint('api-get-devices', getDevices, a => storage.bindTableInput(a, "devices", "Devices")).url;
        this.getTelemetryUrl = this.createApiEndpoint('api-get-telemetry', getTelemetry, a => storage.bindTableInput(a, "telemetry", "Telemetry", "(PartitionKey eq '{filter}')")).url;
    }

    createApiEndpoint(name: string, callback: any, bindings: (args: azure.appservice.HttpEventSubscriptionArgs) => azure.appservice.HttpEventSubscriptionArgs) {

        let args: azure.appservice.HttpEventSubscriptionArgs = {
            resourceGroup: this.resourceGroup,
            callback: callback,
            methods: ["GET"],
            account: this.storage
        };

        args = bindings(args);
        
        return new azure.appservice.HttpEventSubscription(name, args);
    }
}