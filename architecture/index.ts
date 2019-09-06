import { Workspace, Location, InteractionStyle, StructurizrClient } from "structurizr-typescript";
import { credentials } from "./credentials";
import { CloudGateway } from "./containers/cloudGateway";
import { Ingress } from "./containers/ingress";
import { Storage } from "./containers/storage";
import { Api } from "./containers/api";
import { Dashboard } from "./containers/dashboard";

const workspace = new Workspace();
workspace.name = "IoT Sample Solution";

const user = workspace.model.addPerson("User", "uses the system")!;
const admin = workspace.model.addPerson("Admin", "administers the system and manages user")!;
admin.interactsWith(user!, "manages rights");

const factory = workspace.model.addSoftwareSystem("IoT Sample", "Some IoT system")!;
factory.location = Location.Internal;

const cloudGateway = new CloudGateway(factory);
const storage = new Storage(factory);
const ingress = new Ingress(factory, cloudGateway, storage);

const device = workspace.model.addSoftwareSystem("Factory production machine", "Produces products and collects telemetry data while doing so", Location.External)!;
device.uses(factory, "Send telemetry data", "MQTT", InteractionStyle.Asynchronous);
device.uses(cloudGateway.container, "Send telemetry data", "MQTT / IoT Hub Device SDK", InteractionStyle.Asynchronous);
const deviceSimulator = factory.addContainer("Simulated factory production machine", "Sends simulated telemetry data", "Azure Functions")!;
deviceSimulator.uses(cloudGateway.container, "Send telemetry data", "HTTPS");

const api = new Api(factory, storage);
const dashboard = new Dashboard(factory, api);

user.uses(factory, "view dashboards");
user.uses(dashboard.container, "view dashboards");
admin.uses(factory, "configure users");

const systemContext = workspace.views.createSystemContextView(factory, "factory-context", "The system context view");
systemContext.addNearestNeighbours(factory);

const containerView = workspace.views.createContainerView(factory, "factory-containers", "Container view");
containerView.addAllContainers();
containerView.addNearestNeighbours(factory);

const client = new StructurizrClient(credentials.apiKey, credentials.apiSecret);
client.mergeFromRemote = true;
client.putWorkspace(credentials.workspaceId, workspace).then((c) => {
    console.log("done", c);
}).catch(e => {
    console.log("error", e);
});