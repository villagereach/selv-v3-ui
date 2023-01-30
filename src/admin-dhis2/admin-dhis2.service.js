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
            removeDataset: {
                url: openlmisUrlFactory('/api/serverConfiguration/:serverId/datasets/:datasetId'),
                method: 'DELETE'
            }
        });

        this.getServerConfig = getServerConfig;
        this.addServer = addServer;
        this.editServer = editServer;
        this.removeServer = removeServer;

        this.getServerDatasets = getServerDatasets;
        this.removeDataset = removeDataset;

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

        function removeDataset(serverId, datasetId) {
            return resource.removeDataset({
                serverId: serverId,
                datasetId: datasetId
            }, datasetId).$promise;
        }
    }
})();
