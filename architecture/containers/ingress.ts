import { SoftwareSystem, Container } from "structurizr-typescript";
import { CloudGateway } from "./cloudGateway";
import { Storage } from "./storage";

export class Ingress {

    public container: Container;
    constructor(system: SoftwareSystem, cloudGateway: CloudGateway, storage: Storage) {

        this.container = system.addContainer("ingress", "transforms and persists incoming telemetry data", "Azure Function")!;

        this.container.uses(cloudGateway.container, "receive messages", "Azure Function Event Hub input binding");
        this.container.uses(storage.container, "persist messages and device metadata", "Azure Function Table output binding");
    }
}