/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name admin-dhis2.adminDhis2
     *
     * @description
     * Communicates with the /api/serverConfiguration endpoint of the OpenLMIS server.
     */
    angular
        .module('admin-dhis2')
        .service('adminDhis2', service);

    service.$inject = ['$resource', 'openlmisUrlFactory'];

    function service($resource, openlmisUrlFactory) {

        var resource = $resource(openlmisUrlFactory('/api/serverConfiguration/'), {}, {
            addServer: {
                url: openlmisUrlFactory('/api/serverConfiguration/'),
                method: 'POST'
            },
            editServer: {
                url: openlmisUrlFactory('/api/serverConfiguration/:id'),
                method: 'PUT'
            },
            removeServer: {
                url: openlmisUrlFactory('/api/serverConfiguration/:id'),
                method: 'DELETE'
            },
            getServerDatasets: {
                url: openlmisUrlFactory('/api/serverConfiguration/:id/datasets'),
                method: 'GET'
            },
            getServerDataset: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/dhisDatasets/:datasetId')
            },
            getServerDatasetsList: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/dhisDatasets'),
                method: 'GET'
            },
            addDataset: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets'),
                method: 'POST'
            },
            removeDataset: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId'),
                method: 'DELETE'
            },
            getDataElements: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId/elements'),
                method: 'GET'
            },
            removeDataElement: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId/elements/:elementId'),
                method: 'DELETE'
            },
            addDataElement: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId/elements'),
                method: 'POST'
            },
            getDhisElements: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId/dhisElements'),
                method: 'GET'
            },
            getDhisElementCombos: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId/elementsAndCombos'),
                method: 'GET'
            },
            syncServer: {
                url: openlmisUrlFactory('/api/execute'),
                method: 'POST'
            },
            getProcessingSchedules: {
                url: openlmisUrlFactory('/api/processingSchedules'),
                method: 'GET'
            },
            getProcessingPeriods: {
                url: openlmisUrlFactory('/api/processingPeriods?sort=startDate,desc')
            },
            getDhisPeriodTypes: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/dhisPeriodTypes'),
                method: 'GET',
                isArray: true
            },
            getPeriodMappings: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId/periodMappings'),
                method: 'GET'
            },
            addPeriodMapping: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId/periodMappings'),
                method: 'POST'
            },
            getDataOrderables: {
                url: openlmisUrlFactory('/api/orderables'),
                method: 'GET'
            }
        });

        this.getServerConfig = getServerConfig;
        this.addServer = addServer;
        this.editServer = editServer;
        this.removeServer = removeServer;

        this.getServerDatasets = getServerDatasets;
        this.getServerDataset = getServerDataset;
        this.getServerDatasetsList = getServerDatasetsList;
        this.addDataset = addDataset;
        this.removeDataset = removeDataset;

        this.getDataElements = getDataElements;
        this.removeDataElement = removeDataElement;
        this.addDataElement = addDataElement;

        this.getDhisElements = getDhisElements;
        this.getDhisElementCombos = getDhisElementCombos;
        this.getDataOrderables = getDataOrderables;
        this.getProcessingSchedules = getProcessingSchedules;
        this.getProcessingPeriods = getProcessingPeriods;
        this.getDhisPeriodTypes = getDhisPeriodTypes;
        this.syncServers = syncServers;
        this.syncServer = syncServer;

        this.getPeriodMappings = getPeriodMappings;
        this.addPeriodMapping = addPeriodMapping;

        this.getProcessingSchedules = getProcessingSchedules;

        function getServerConfig() {
            return resource.get().$promise;
        }

        function addServer(server) {
            var requestServerData = server.items[0];
            return resource.addServer(requestServerData).$promise;
        }

        function editServer(server, serverId) {
            return resource.editServer({
                id: serverId
            }, server).$promise;
        }

        function removeServer(server) {
            return resource.removeServer({
                id: server
            }, server).$promise;
        }

        function getServerDatasets(serverId) {
            return resource.getServerDatasets({
                id: serverId
            }, serverId).$promise;
        }

        function getServerDataset(serverId, datasetId) {
            return resource.getServerDataset({
                serverId: serverId,
                datasetId: datasetId
            }).$promise;
        }

        function getServerDatasetsList(serverId) {
            return resource.getServerDatasetsList({
                serverId: serverId
            }, serverId).$promise;
        }

        function addDataset(serverId, dataset) {
            return resource.addDataset({
                serverId: serverId,
                dataset: dataset
            }, dataset).$promise;
        }

        function removeDataset(serverId, datasetId) {
            return resource.removeDataset({
                serverId: serverId,
                datasetId: datasetId
            }, datasetId).$promise;
        }

        function getDataElements(serverId, datasetId) {
            return resource.getDataElements({
                serverId: serverId,
                datasetId: datasetId
            }, datasetId).$promise;
        }

        function addDataElement(serverId, datasetId, element) {
            return resource.addDataElement({
                serverId: serverId,
                datasetId: datasetId,
                element: element
            }, element).$promise;
        }

        function removeDataElement(serverId, datasetId, elementId) {
            return resource.removeDataElement({
                serverId: serverId,
                datasetId: datasetId,
                elementId: elementId
            }, elementId).$promise;
        }

        function getDhisElements(serverId, datasetId) {
            return resource.getDhisElements({
                serverId: serverId,
                datasetId: datasetId
            }, datasetId).$promise;
        }

        function getDhisElementCombos(serverId, datasetId) {
            return resource.getDhisElementCombos({
                serverId: serverId,
                datasetId: datasetId
            }, datasetId).$promise;
        }

        function getDataOrderables() {
            return resource.getDataOrderables().$promise;
        }

        function getProcessingSchedules() {
            return resource.getProcessingSchedules().$promise;
        }

        function getProcessingPeriods() {
            return resource.getProcessingPeriods().$promise;
        }

        function getDhisPeriodTypes(serverId) {
            return resource.getDhisPeriodTypes({
                serverId: serverId
            }).$promise;
        }

        function getPeriodMappings(serverId, datasetId) {
            return resource.getPeriodMappings({
                serverId: serverId,
                datasetId: datasetId
            }, datasetId).$promise;
        }

        function addPeriodMapping(serverId, datasetId, periodMapping) {
            return resource.addPeriodMapping({
                serverId: serverId,
                datasetId: datasetId
            }, periodMapping).$promise;
        }

        function syncServers() {
            return resource.syncServers().$promise;
        }

        function syncServer(serverId, datasetId, periodMappingId, facilityCodes) {
            return resource.syncServer({
                serverId: serverId,
                datasetId: datasetId,
                periodMappingId: periodMappingId
            }, facilityCodes).$promise;
        }
    }
})();
