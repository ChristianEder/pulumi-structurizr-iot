import { SoftwareSystem, Container } from "structurizr-typescript"

export class Storage {

    public container: Container;

    constructor(system: SoftwareSystem){
        this.container = system.addContainer("Telemetry Storage", "stores telemetry data", "Table Storage")!;
    }
}