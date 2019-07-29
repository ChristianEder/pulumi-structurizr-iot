import * as azure from "@pulumi/azure"
import { Dashboard } from "./resources/dashboard";
import { Ingress } from "./resources/ingress";
import { Api } from "./resources/api";
import { Storage } from "./resources/storage";

const resourceGroup = new azure.core.ResourceGroup("pulumi-structurizr-iot", {
  location: "WestEurope",
});


const storage = new Storage(resourceGroup);
const ingress = new Ingress(resourceGroup, storage);
const api = new Api(resourceGroup, storage);
const dashboard = new Dashboard(resourceGroup, storage, api);

export const apiGetDevicesUrl = api.getDevicesUrl;
export const apiGetTelemetryUrl = api.getTelemetryUrl;
export const dashboardUrl = dashboard.url;
