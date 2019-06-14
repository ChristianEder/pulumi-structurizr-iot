import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure"
import { HttpRequest } from "@pulumi/azure/appservice";

export class Api {

    public getDevicesUrl: pulumi.Output<string>;
    public getTelemetryUrl: pulumi.Output<string>;

    constructor(resourceGroup: azure.core.ResourceGroup, storage: azure.storage.Account) {

        this.getDevicesUrl = this.createGetDevices(resourceGroup, storage).url;
        this.getTelemetryUrl = this.createGetTelemetry(resourceGroup, storage).url;
    }

    createGetDevices(resourceGroup: azure.core.ResourceGroup, storage: azure.storage.Account) {
        let args: azure.appservice.HttpEventSubscriptionArgs = {
            resourceGroup,
            callback: async (context, req: HttpRequest) => {

                const devices: { LastTelemetryModel: string, LastTelemetrySentAt: string, PartitionKey: string, RowKey: string }[] = context.bindings.devices;

                return {
                    status: 200,
                    body: JSON.stringify(devices.map(d => ({ id: d.RowKey, lastTelemetrySentAt: d.LastTelemetrySentAt, lastTelemetryModel: JSON.parse(d.LastTelemetryModel) })))
                };
            },
            methods: ["GET"],
            account: storage
        };

        args = storage.bindTableInput(args, "devices", "Devices");

        return new azure.appservice.HttpEventSubscription('api-get-devices', args);
    }

    createGetTelemetry(resourceGroup: azure.core.ResourceGroup, storage: azure.storage.Account) {
        let args: azure.appservice.HttpEventSubscriptionArgs = {
            resourceGroup,
            callback: async (context, req: HttpRequest) => {

                const telemetry: { Type: string, Value: number, Timestamp: string, TimestampTicks: number }[] = context.bindings.telemetry;

                return {
                    status: 200,
                    body: JSON.stringify({
                        id: req.query.filter.split("_")[0],
                        ["telemetryType"]: req.query.filter.split("_")[1],
                        values : telemetry.map(t => ({value: t.Value, at: t.Timestamp}))
                    })
                };
            },
            methods: ["GET"],
            account: storage
        };

        args = storage.bindTableInput(args, "telemetry", "Telemetry", "(PartitionKey eq '{filter}')");

        return new azure.appservice.HttpEventSubscription('api-get-telemetry', args);
    }
}