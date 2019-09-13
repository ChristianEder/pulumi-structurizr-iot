import * as azure from "@pulumi/azure";
import { Storage } from "./storage";
import { Ingress } from "./ingress";
import * as architectureFlags from "../../architecture/architecture-flags";

export class Aggregation {
    constructor(resourceGroup: azure.core.ResourceGroup, ingress: Ingress, storage: Storage) {

        const consumerGroup = new azure.iot.ConsumerGroup("aggregation", {
            resourceGroupName: resourceGroup.name,
            eventhubEndpointName: "events",
            iothubName: ingress.iotHub.name,
        });


        // PartitionKey: context.bindingData.systemProperties["iothub-connection-device-id"] + "_" + d.Type,
        // RowKey: Number.MAX_SAFE_INTEGER - new Date(d.Timestamp).getTime(),

        // TBD: timestamp by currently does not work combined with CROSS APPLY
        // https://stackoverflow.com/questions/38084352/in-azure-stream-analytics-query-i-am-getting-an-error-when-using-timestamp-by
        let query = `WITH 
                        telemetryMessages AS (
                            SELECT IoTHub.ConnectionDeviceId as deviceId, [telemetry].DataPoints as datapoints
                            FROM telemetry),
        
                        telemetryDatapoints AS (  
                            SELECT [telemetryMessages].deviceId as deviceId, datapoints.ArrayValue.Type AS type, datapoints.ArrayValue.Value AS value   
                            FROM telemetryMessages  
                            CROSS APPLY GetArrayElements ([telemetryMessages].DataPoints) as datapoints)`;

        if (architectureFlags.doAggregation) {
            query += `

                SELECT CONCAT ([telemetryDatapoints].deviceId, '_', [telemetryDatapoints].type) AS PartitionKey, UDF.toEpochSeconds(System.Timestamp) AS RowKey, avg([telemetryDatapoints].value) as Average, max([telemetryDatapoints].value) as Maximum, min([telemetryDatapoints].value) as Minimum, [telemetryDatapoints].type as Type, System.Timestamp() as Timestamp
                INTO  aggregatedTelemetry
                FROM telemetryDatapoints
                GROUP BY [telemetryDatapoints].deviceId, [telemetryDatapoints].type, TumblingWindow(minute, 5)`;
        }

        if (architectureFlags.ingress === "StreamAnalytics") {
            query += `       

                SELECT CONCAT ([telemetryDatapoints].deviceId, '_', [telemetryDatapoints].type) AS PartitionKey, UDF.toEpochSeconds(System.Timestamp) AS RowKey, [telemetryDatapoints].value as Value, [telemetryDatapoints].type as Type, System.Timestamp() as Timestamp
                INTO  rawTelemetry
                FROM telemetryDatapoints`;
        }

        const job = new azure.streamanalytics.Job("aggregation", {
            resourceGroupName: resourceGroup.name,
            compatibilityLevel: "1.1",
            dataLocale: "en-US",
            eventsLateArrivalMaxDelayInSeconds: -1,
            eventsOutOfOrderMaxDelayInSeconds: 599,
            eventsOutOfOrderPolicy: "Adjust",
            outputErrorPolicy: "Stop",
            streamingUnits: 1,
            transformationQuery: query
        });

        const input = new azure.streamanalytics.StreamInputIotHub("telemetry", {
            resourceGroupName: resourceGroup.name,
            endpoint: "messages/events",
            eventhubConsumerGroupName: consumerGroup.name,
            iothubNamespace: ingress.iotHub.name,
            name: "telemetry",
            serialization: {
                encoding: "UTF8",
                type: "Json",
            },
            sharedAccessPolicyKey: ingress.ownerSharedAccessPolicyKey,
            sharedAccessPolicyName: "iothubowner",
            streamAnalyticsJobName: job.name,
        });

        this.defineOutputs(resourceGroup, storage, job);

        this.defineUDFs(resourceGroup, job);
    }

    private defineUDFs(resourceGroup: azure.core.ResourceGroup, job: azure.streamanalytics.Job) {
        // TODO: this is a workaround for as long as pulumi doesnt support UDFs natively
        const udfArm = {
            "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
            "contentVersion": "1.0.0.0",
            "parameters": {
                "jobName": { "type": "string" }
            },
            "resources": [{
                "type": "Microsoft.StreamAnalytics/streamingjobs/functions",
                "apiVersion": "2016-03-01",
                "name": "[concat(parameters('jobName'), '/toEpochSeconds')]",
                "properties": {
                    "type": "Scalar",
                    "properties": {
                        "inputs": [
                            {
                                "dataType": "any"
                            }
                        ],
                        "output": {
                            "dataType": "any"
                        },
                        "binding": {
                            "type": "Microsoft.StreamAnalytics/JavascriptUdf",
                            "properties": {
                                "script": "function toEpochSeconds(outputTime) {\n    var date = Date.parse(outputTime);\nvar epochSeconds = Math.round(date / 1000);\nreturn epochSeconds.toString().padStart(19, 0);\n}"
                            }
                        }
                    }
                }
            }]
        };

        const udf = new azure.core.TemplateDeployment("aggregation-udf", {
            resourceGroupName: resourceGroup.name,
            deploymentMode: "Incremental",
            templateBody: JSON.stringify(udfArm),
            parameters: {
                jobName: job.name
            }
        });
    }

    private defineOutputs(resourceGroup: azure.core.ResourceGroup, storage: Storage, job: azure.streamanalytics.Job) {
        // TODO: this is a workaround for as long as pulumi doesnt support Table Output natively

        const outputs = [];

        if(architectureFlags.doAggregation){
            outputs.push(this.defineOutput("aggregatedTelemetry"));
        }

        if (architectureFlags.ingress === "StreamAnalytics") {
            outputs.push(this.defineOutput("rawTelemetry"));
        }

        const parameters: { [name: string]: any } = {
            "accountName": { "type": "string" },
            "accountKey": { "type": "string" },
            "jobName": { "type": "string" }
        };
        const parameterValues: { [name: string]: any } = {
            accountName: storage.account.name,
            accountKey: storage.account.primaryAccessKey,
            jobName: job.name
        };

        if (architectureFlags.doAggregation) {
            parameters["table_aggregatedTelemetry"] = { "type": "string" };
            parameterValues["table_aggregatedTelemetry"] = storage.aggregatedTelemetry.name;
        }

        if (architectureFlags.ingress === "StreamAnalytics") {
            parameters["table_rawTelemetry"] = { "type": "string" };
            parameterValues["table_rawTelemetry"] = storage.telemetry.name;
        }

        const outputArm = {
            "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
            "contentVersion": "1.0.0.0",
            "parameters": parameters,
            "resources": outputs
        };

        const output = new azure.core.TemplateDeployment("aggregation-out", {
            resourceGroupName: resourceGroup.name,
            deploymentMode: "Incremental",
            templateBody: JSON.stringify(outputArm),
            parameters: parameterValues
        });
    }

    private defineOutput(name: string) {
        return {
            "name": "[concat(parameters('jobName'), '/" + name + "')]",
            "type": "Microsoft.StreamAnalytics/streamingjobs/outputs",
            "apiVersion": "2016-03-01",
            "properties": {
                "datasource": {
                    "type": "Microsoft.Storage/Table",
                    "properties": {
                        "accountName": "[parameters('accountName')]",
                        "accountKey": "[parameters('accountKey')]",
                        "table": "[parameters('table_" + name + "')]",
                        "partitionKey": "PartitionKey",
                        "rowKey": "RowKey",
                        "batchSize": 10
                    }
                },
                "serialization": {
                    "type": "Json",
                    "properties": {
                        "encoding": "UTF8"
                    }
                }
            }
        };
    }
}