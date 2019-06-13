import * as azure from "@pulumi/azure";
import * as iot from "@pulumi/azure/iot";

export class Ingress {

    constructor(resourceGroup: azure.core.ResourceGroup, storage: azure.storage.Account) {

        const iotHub = new iot.IoTHub("hub", {
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

        let args: iot.IoTHubSubscriptionArgs = {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            account: storage,
            callback: async (context, message) => {
                console.log("ctx: " + JSON.stringify(context, null, 4));
                console.log("arg: " + JSON.stringify(message));
                let bindings = <any>context.bindings;

                let dataPoints: { Type: string, Value: number, Timestamp: string, TimestampTicks: number }[] = message.DataPoints;
                
                let transform = (d: { Type: string, Value: number, Timestamp: string, TimestampTicks: number }) => ({
                    PartitionKey: context.bindingData.systemProperties["iothub-connection-device-id"] + "_" + d.Type,
                    RowKey: d.TimestampTicks,
                    Value: d.Value,
                    MeasuredAt: d.Timestamp
                });

                bindings.devices =[{
                    PartitionKey: "devices",
                    RowKey: context.bindingData.systemProperties["iothub-connection-device-id"],
                    LastTelemetrySentAt: context.bindingData.systemProperties["iothub-enqueuedtime"],
                    LastTelemetryModel: JSON.stringify([...(new Set(dataPoints.map(d => d.Type)))])
                }];
                bindings.telemetry = dataPoints.map(transform);
            }
        }
        args = storage.bindTableOutput(args, "telemetry", "Telemetry");
        args = storage.bindTableOutput(args, "devices", "Devices");

        iotHub.onEvent("telemetry", args);
    }


}

