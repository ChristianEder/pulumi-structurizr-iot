import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure"
import { Dashboard } from "./resources/dashboard";
import { Ingress } from "./resources/ingress";

const resourceGroup = new azure.core.ResourceGroup("pulumi-structurizr-iot", {
  location: "WestEurope",
});

const account = new azure.storage.Account("storage", {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  accountTier: "Standard",
  accountReplicationType: "LRS",
});

const dashboard = new Dashboard(resourceGroup, account);
const ingress = new Ingress(resourceGroup, account);

export const dashboardUrl = dashboard.url;