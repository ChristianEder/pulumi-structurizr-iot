export const storeReceivedMessage = async (context:any, message:any) => {
    console.log("ctx: " + JSON.stringify(context, null, 4));
    console.log("arg: " + JSON.stringify(message));
    let bindings = <any>context.bindings;

    let dataPoints: { Type: string, Value: number, Timestamp: string }[] = message.DataPoints;

    let transform = (d: { Type: string, Value: number, Timestamp: string }) => ({
        PartitionKey: context.bindingData.systemProperties["iothub-connection-device-id"] + "_" + d.Type,
        RowKey: Number.MAX_SAFE_INTEGER - new Date(d.Timestamp).getTime(),
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