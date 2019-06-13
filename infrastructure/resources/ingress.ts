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
                    PartitionKey: context.bindingData.systemProperties["iothub-connection-device-id"],
                    RowKey: d.TimestampTicks,
                    Value: d.Value,
                    MeasuredAt: d.Timestamp
                });

                bindings.temperature = dataPoints.filter(p => p.Type === "temperature").map(transform);
                bindings.humidity = dataPoints.filter(p => p.Type === "humidity").map(transform);
            }
        }
        args = storage.bindTableOutput(args, "temperature", "Temperature");
        args = storage.bindTableOutput(args, "humidity", "Humidity");

        iotHub.onEvent("telemetry", args);
    }


}

