import { SoftwareSystem, Container } from "structurizr-typescript";
import { Api } from "./api";

export class Dashboard {

    public container: Container;
    constructor(system: SoftwareSystem, api: Api) {

        this.container = system.addContainer("dashboard", "visualizes telemetry data", "React hosted on Azure App Service")!;

        this.container.uses(api.container, "load messages and devices", "HTTP");
    }
}