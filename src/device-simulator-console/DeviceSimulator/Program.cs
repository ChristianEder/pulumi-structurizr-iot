using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;
using Newtonsoft.Json;

namespace DeviceSimulator
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Starting to send messages");
            Console.WriteLine("| ");

            var cancellation = new CancellationTokenSource();
            SendMessages(args[0], cancellation.Token);

            Console.ReadLine();
            cancellation.Cancel();

            Console.WriteLine("Stopped sending messages");
        }

        private static async void SendMessages(string connectionString, CancellationToken cancellationToken)
        {
            var client = DeviceClient.CreateFromConnectionString(connectionString);
            var latestPressure = 30.0;
            var latestHumidity = 50.0;
            while (true)
            {
                await SendMessage(client, ref latestPressure, ref latestHumidity);
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }

                await Task.Delay(1000);
            }
        }

        private static Task SendMessage(DeviceClient client, ref double latestPressure, ref double latestHumidity)
        {
            try
            {
                var random = new Random();

                var newPressure = latestPressure = latestPressure + random.Next(-2, 3);
                var newHumidity = latestHumidity = latestHumidity + random.Next(-2, 3);

                var messageBytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(new TelemetryMessage
                {
                    DataPoints =
                    {
                        new DataPoint
                        {
                            Value = newPressure,
                            Type = "pressure",
                            Timestamp = DateTime.UtcNow
                        },
                        new DataPoint
                        {
                            Value = newHumidity,
                            Type = "humidity",
                            Timestamp = DateTime.UtcNow
                        }
                    }
                }));
                var now = (long)(DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalSeconds;

                var message = new Message(messageBytes);
                message.Properties.Add("SentAt", now.ToString());
                message.Properties.Add("PayloadVersion", "1");
                message.MessageId = Guid.NewGuid().ToString();
                Console.Write(".");

                return client.SendEventAsync(message);
            }
            catch (Exception e)
            {
                Console.Write("x");
                return Task.CompletedTask;
            }
        }
    }

    public class TelemetryMessage
    {
        public List<DataPoint> DataPoints { get; } = new List<DataPoint>();
    }

    public class DataPoint
    {
        public string Type { get; set; }
        public double Value { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
