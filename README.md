# pulumi-structurizr-iot

This is a demonstration of how [pulumi](https://pulumi.io) and [structurizr](https://structurizr.com) can be used to build an IoT solution on [Microsoft Azure](https://portal.azure.com) using techniques such as
- Infrastructure as Code - defining cloud resources, build & deployment pipelines as source code (using [pulumi](https://pulumi.io))
- Architecture as Code - describing the solutions architecture using a sourcecode based architecture description language (using [structurizr](https://structurizr.com))

## Contents

- [src](/src) contains the source code for the following components:
  - [dashboard](/src/dashboard) contains a [react](https://reactjs.org/)-based frontend for the IoT solution
  - [api](/src/api) contains the implementation of the API used by the dashboard application
  - [ingress](/src/ingress) contains the implementation of the data ingress layer of the IoT solution
- [infrastructure](/infrastructure) contains [pulumi](https://pulumi.io) code that sets up the following resources in Azure and deploys the code implemented in [src](/src) to those resources
  - Which resources get created is described in the architecture model below
- [architecture](/architecture) contains [structurizr](https://structurizr.com) code (using [structurizr-typescript](https://www.npmjs.com/package/structurizr-typescript)) that describes the system architecture

## Architecture
<img src="./architecture/architecture.svg">

## Getting started

### Prerequisites:
- [nodejs & npm](https://nodejs.org/en/)
- [pulumi](https://pulumi.io/quickstart/install/)
  - You also have to set up an account at pulumi
- [Microsoft Azure subscription](https://azure.microsoft.com/de-de/free/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
  - Login with your Microsoft account that you used to setup the Azure subscription using
  > az login
- Optional (only required if you want to update the architecture model)
  - An account at [structurizr](https://structurizr.com)
  - Create a new workspace
  - Create a file named "credentials.ts" in the [architecture](/architecture) folder containing your workspace credentials as required by [architecture/index.ts](/architecture/index.ts)

### Deploy 

- On windows, you can just run the following command in the repositories root directory
  > ./deploy.ps1
- On other operating systems, follow the instructions you find in [deploy.ps1](deploy.ps1) 

The script will output the URLs of the resources that where created in the command line. After that, you can send messages to the IoT Hub in the format described in [src/ingress/storeReceivedMessage.ts](), and they should end up being shown in the dashboard.

**Known Issue**

Unfortunately, for now pulumi does not support configuring CORS for the Azure functions getting created - you have to do that manually by logging in to the [Azure portal](https://portal.azure.com), selecting the azure function apps created for *api-get-devices* and *api-get-telemetry*, and enabling CORS for the URL where your dashboard gets hosted (and possibly also http://localhost:8080) if you want to run it locally.

### Update architecture model

> cd architecture\
> npm i\
> npm run structurizr

### Run the dashboard locally

> cd src/dashboard\
> npm i\
> npm start\
> // now open http://localhost:8080 in a browser

Please note that the dashboard implementation expects the URLs of the API created during the deployment step in a global variable *window.apiUrls* (see [src/dashboard/src/api/api.ts]()), which is only set in the version of the dashboard that gets deployed to Azure. Locally, you have to set ths variable manually.