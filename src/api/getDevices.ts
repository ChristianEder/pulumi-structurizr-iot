export const getDevices = async (context:any, req:any) => {

    const devices: { LastTelemetryModel: string, LastTelemetrySentAt: string, PartitionKey: string, RowKey: string }[] = context.bindings.devices;

    return {
        status: 200,
        body: JSON.stringify(devices.map(d => ({ id: d.RowKey, lastTelemetrySentAt: d.LastTelemetrySentAt, lastTelemetryModel: JSON.parse(d.LastTelemetryModel) })))
    };
};