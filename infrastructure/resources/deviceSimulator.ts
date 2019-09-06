import * as azure from '@pulumi/azure';
import * as pulumi from '@pulumi/pulumi';
import { Ingress } from './ingress';
import { Registry, Device } from 'azure-iothub';
import { Storage } from './storage';
import { simulate } from '../../src/device-simulator';

export class DeviceSimulator {
    constructor(resourceGroup: azure.core.ResourceGroup, ingress: Ingress, storage: Storage, insights: azure.appinsights.Insights) {
        pulumi.all([ingress.ownerConnectionString, ingress.iotHub.name]).apply(async ([c, n]) => {
            const registry = Registry.fromConnectionString(c);
            const devices = await this.getDevices(registry, 10);

            new azure.appservice.MultiCallbackFunctionApp("device-simulation", {
                resourceGroup,
                account: storage.account,
                // If we want to simluate more than just 10 devices, we should not
                // create a function for every single device and
                // instead create functions that simulate batches of devices
                functions: devices.map(d => {
                    return new azure.appservice.TimerFunction(d.deviceId, {
                        schedule: "*/5 * * * * *",
                        callback: simulate(d.deviceId, this.getConnectionString(d, n))
                    });
                }),
                appSettings: {
                    "APPINSIGHTS_INSTRUMENTATIONKEY": insights.instrumentationKey
                }
            });
        });
    }

    private async getDevices(registry: Registry, count: number) {
        const devices = [];
        for (var i = 0; i < count; i++) {
            var device = await this.getOrCreateDevice(i, registry);
            devices.push(device);
        }
        return devices;
    }

    private async getOrCreateDevice(i: number, registry: Registry) {
        const deviceId = "simulated-device-" + (i + 1);
        let device = await this.getDevice(deviceId, registry);
        if (!device) {
            await registry.addDevices([{ deviceId }]);
            device = await this.getDevice(deviceId, registry);
            if (!device) {
                throw new Error("Creating a simulated device failed");
            }
        }
        return device;
    }

    private async getDevice(deviceId: string, registry: Registry) {
        try {
            var response = await registry.get(deviceId);
            return response.responseBody;
        } catch {
            return undefined;
        }
    }

    private getConnectionString(device: Device, iotHubName: string) {

        return `HostName=${iotHubName}.azure-devices.net;DeviceId=${device.deviceId};SharedAccessKey=${device.authentication!.symmetricKey!.primaryKey}`;
    }
}