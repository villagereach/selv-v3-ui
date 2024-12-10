# OpenLMIS SELV-V3 UI
This user interface is designed to be a single page web application that is optimized for offline and low-bandwidth environments.

Multiple UI modules are compiled together with the OpenLMIS dev-ui to create the OpenLMIS Reference-UI. UI modules included in the OpenLMIS Reference-UI are:
* [OpenLMIS Auth UI](https://github.com/OpenLMIS/openlmis-auth-ui)
* [OpenLMIS Fulfillment UI](https://github.com/OpenLMIS/openlmis-fulfillment-ui)
* [OpenLMIS Reference Data UI](https://github.com/OpenLMIS/openlmis-referencedata-ui)
* [OpenLMIS Report UI](https://github.com/OpenLMIS/openlmis-report-ui)
* [OpenLMIS Requisition UI](https://github.com/OpenLMIS/openlmis-requisition-ui)
* [OpenLMIS UI Components](https://github.com/OpenLMIS/openlmis-ui-components)
* [OpenLMIS UI Layout](https://github.com/OpenLMIS/openlmis-ui-layout)

Before pushing a new version of the docker image, you need to provide user-based credentials. They must be defined in the .env file and should have the following form:
```bash
# User-based Client ID and secret
AUTH_SERVER_CLIENT_ID=<clientId>
AUTH_SERVER_CLIENT_SECRET=<clientSecret>
```

## Feature Flags
- `CATCHMENT_POPULATION_CALC_AUTO`: By default __true__. This feature flag controls whether the catchment population is automatically aggregated (`editable only in the lowest-level geo zones, such as districts, and then automatically propagated to higher levels like provinces and the country`) or allows for manual editing. You can modify the default value in the file: `catchment-population-auto-calc.flag.run.js`. Additionally, you can define which geographic level should be treated as the lowest (e.g., if a level lower than the district is introduced) in: `geographic-level.service.js`. You can also modify `CATCHMENT_POPULATION_CALC_AUTO` via `settings.env`.
