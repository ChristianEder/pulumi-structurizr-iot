import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure"
import { Dashboard } from "./resources/dashboard";
import { Ingress } from "./resources/ingress";
import { Api } from "./resources/api";

const resourceGroup = new azure.core.ResourceGroup("pulumi-structurizr-iot", {
  location: "WestEurope",
});

const account = new azure.storage.Account("storage", {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  accountTier: "Standard",
  accountReplicationType: "LRS",
});

const ingress = new Ingress(resourceGroup, account);
const api = new Api(resourceGroup, account);
const dashboard = new Dashboard(resourceGroup, account);

export const apiGetDevicesUrl = api.getDevicesUrl;
export const apiGetTelemetryUrl = api.getTelemetryUrl;
export const dashboardUrl = dashboard.url;
