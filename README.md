# OpenLMIS SELV-V3 UI
The SELV-V3 user interface is designed to be a single page web application that is optimized for offline and low-bandwidth environments.

Multiple UI modules are compiled together with the OpenLMIS dev-ui to create the SELV-V3 UI. The following UI modules are included:
- [OpenLMIS Auth UI](https://github.com/OpenLMIS/openlmis-auth-ui)
- [OpenLMIS Fulfillment UI](https://github.com/OpenLMIS/openlmis-fulfillment-ui)
- [OpenLMIS Reference Data UI](https://github.com/OpenLMIS/openlmis-referencedata-ui)
- [OpenLMIS Report UI](https://github.com/OpenLMIS/openlmis-report-ui)
- [OpenLMIS Requisition UI](https://github.com/OpenLMIS/openlmis-requisition-ui)
- [OpenLMIS UI Components](https://github.com/OpenLMIS/openlmis-ui-components)
- [OpenLMIS UI Layout](https://github.com/OpenLMIS/openlmis-ui-layout)
- [OpenLMIS Stock Management UI](https://github.com/OpenLMIS/openlmis-stockmanagement-ui)
- [OpenLMIS CCE UI](https://github.com/OpenLMIS/openlmis-cce-ui)
- [OpenLMIS Offline UI](https://github.com/OpenLMIS/openlmis-offline-ui)

In addition to the modules above, the SELV-V3 UI also includes:
- [Equipment UI](https://github.com/villagereach/openlmis-equipment-ui)
- [Requisition Batch UI](https://github.com/villagereach/selv-v3-requisition-batch-ui)

Before pushing a new version of the docker image, you need to provide user-based credentials. They must be defined in the .env file and should have the following form:
```bash
# User-based Client ID and secret
AUTH_SERVER_CLIENT_ID=<clientId>
AUTH_SERVER_CLIENT_SECRET=<clientSecret>
```
