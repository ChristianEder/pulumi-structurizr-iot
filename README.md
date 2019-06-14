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