import { SoftwareSystem, Container } from "structurizr-typescript"

export class Storage {

    public container: Container;
    constructor(system: SoftwareSystem){

        this.container = system.addContainer("storage", "stores telemetry data", "Table Storage")!;
    }
}