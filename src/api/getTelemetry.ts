export const getTelemetry = async (context: any, req: any) => {

    const telemetry: { Type: string, Value: number, Timestamp: string }[] = context.bindings.telemetry;
    const aggregatedTelemetry: { Type: string, Average: number, Minimum: number, Maximum: number, Timestamp: string }[] = context.bindings.aggregatedTelemetry;

    return {
        status: 200,
        body: JSON.stringify({
            id: req.query.filter.split("_")[0],
            ["telemetryType"]: req.query.filter.split("_")[1],
            values: telemetry.map(t => ({ value: t.Value, at: t.Timestamp })),
            aggregatedValues: aggregatedTelemetry.map(t => (
                {
                    average: t.Average,
                    minimum: t.Minimum,
                    maximum: t.Maximum,
                    at: t.Timestamp
                }))
        })
    };
}