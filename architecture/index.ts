import { Workspace, Location, InteractionStyle, StructurizrClient } from "structurizr-typescript";
import { credentials } from "./credentials";
import { CloudGateway } from "./containers/cloudGateway";
import { Ingress } from "./containers/ingress";
import { Storage } from "./containers/storage";
import { Api } from "./containers/api";
import { Dashboard } from "./containers/dashboard";

var workspace = new Workspace();
workspace.name = "IoT Sample Solution";

var user = workspace.model.addPerson("User", "uses the system")!;
var admin = workspace.model.addPerson("Admin", "administers the system and manages user")!;
admin.interactsWith(user!, "manages rights");

var factory = workspace.model.addSoftwareSystem("IoT Sample", "Some IoT system")!;
factory.location = Location.Internal;

var cloudGateway = new CloudGateway(factory);
var storage = new Storage(factory);
var ingress = new Ingress(factory, cloudGateway, storage);
var api = new Api(factory, storage);
var dashboard = new Dashboard(factory, api);

user.uses(factory, "view dashboards");
user.uses(dashboard.container, "view dashboards");
admin.uses(factory, "configure users");

var systemContext = workspace.views.createSystemContextView(factory, "factory-context", "The system context view");
systemContext.addNearestNeighbours(factory);

var containerView = workspace.views.createContainerView(factory, "factory-containers", "Container view");
containerView.addAllContainers();
containerView.addNearestNeighbours(factory);

var client = new StructurizrClient(credentials.apiKey, credentials.apiSecret);
client.putWorkspace(credentials.workspaceId, workspace).then((c) => {
    console.log("done", c);
}).catch(e => {
    console.log("error", e);
});