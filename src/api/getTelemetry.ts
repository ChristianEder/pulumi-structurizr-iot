export const getTelemetry = async (context:any, req:any) => {

    const telemetry: { Type: string, Value: number, Timestamp: string, TimestampTicks: number }[] = context.bindings.telemetry;

    return {
        status: 200,
        body: JSON.stringify({
            id: req.query.filter.split("_")[0],
            ["telemetryType"]: req.query.filter.split("_")[1],
            values: telemetry.map(t => ({ value: t.Value, at: t.Timestamp }))
        })
    };
}