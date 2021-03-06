import { SoftwareSystem, Container } from "structurizr-typescript"

export class CloudGateway{

    public container: Container;

    constructor(system: SoftwareSystem){
        this.container = system.addContainer("IoT Hub", "accepts incoming telemetry data", "IoT Hub")!;
    }
}