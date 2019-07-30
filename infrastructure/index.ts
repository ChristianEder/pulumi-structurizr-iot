import * as azure from "@pulumi/azure"
import { Dashboard } from "./resources/dashboard";
import { Ingress } from "./resources/ingress";
import { Api } from "./resources/api";
import { Storage } from "./resources/storage";
import { DeviceSimulator } from "./resources/deviceSimulator";

const resourceGroup = new azure.core.ResourceGroup("pulumi-structurizr-iot", {
    location: "WestEurope",
});

const insights = new azure.appinsights.Insights("insights", {
    resourceGroupName: resourceGroup.name,
    applicationType: "Node.JS"
});

const storage = new Storage(resourceGroup);
const ingress = new Ingress(resourceGroup, storage, insights);
const api = new Api(resourceGroup, storage, insights);
const dashboard = new Dashboard(resourceGroup, storage, api);

// TODO: don't instantiate in stacks != dev
const deviceSimulator = new DeviceSimulator(resourceGroup, ingress, storage, insights);

export const apiGetDevicesUrl = api.getDevicesUrl;
export const apiGetTelemetryUrl = api.getTelemetryUrl;
export const dashboardUrl = dashboard.url;
