import { async } from "q";

export interface Device {
    id: string,
    lastTelemetrySentAt: string,
    lastTelemetryModel: string[]
};

export interface Telemetry {
    id: string,
    telemetryType: string,
    values: TelemetryValue[]
};

export interface TelemetryValue {
    value: number,
    at: string
}

class Api {

    private devices: Device[];

    getDevices = async () => {
        if (!this.devices) {
            var w = <any>window;
            if (!w.apiUrls) {
                return [];
            }
            var response = await fetch(w.apiUrls.getDevicesUrl);
            this.devices = await response.json();
        }
        return this.devices;
    };

    getTelemetry = async (deviceId: string, type: string) => {
        var w = <any>window;
        if (!w.apiUrls) {
            return null;
        }
        var response = await fetch(w.apiUrls.getTelemetryUrl + "?filter=" + deviceId + "_" + type);
        var data: Telemetry = await response.json();
        return data;
    }
}

export const api = new Api();
