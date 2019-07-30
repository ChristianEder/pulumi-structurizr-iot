import { Message } from 'azure-iot-device';
import { clientFromConnectionString } from 'azure-iot-device-http';

export const simulate = (deviceId: string, connectionString: string) => {

    let lastDataSent = {
        temperature: 30,
        humidity:55
    };

    return async () => {
        console.log("Simulated: " + deviceId);
        const client = clientFromConnectionString(connectionString);

        const temperature = {
            Value: lastDataSent.temperature + Math.random() - 0.5,
            Type: "temperature",
            Timestamp: new Date().toUTCString()
        };
        lastDataSent.temperature = temperature.Value;

        const humidity = {
            Value: lastDataSent.humidity + Math.random() - 0.5,
            Type: "humidity",
            Timestamp: new Date().toUTCString()
        };
        lastDataSent.humidity = humidity.Value;

        const message =new Message(JSON.stringify({
            DataPoints : [
                temperature,
                humidity
            ]
        }));

        await client.sendEvent(message);
    };
};