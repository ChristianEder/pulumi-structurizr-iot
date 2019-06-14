import { SoftwareSystem, Container } from "structurizr-typescript";
import { Storage } from "./storage";

export class Api {

    public container: Container;
    constructor(system: SoftwareSystem, storage: Storage) {

        this.container = system.addContainer("api", "serves telemetry data", "Azure Function")!;

        this.container.uses(storage.container, "load messages and devices", "Azure Function Table input binding");
    }
}