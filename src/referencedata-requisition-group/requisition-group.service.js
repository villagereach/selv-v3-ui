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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name referencedata-requisition-group.requisitionGroupService
     *
     * @description
     * Responsible for retrieving requisition groups from the server.
     */
    angular
        .module('referencedata-requisition-group')
        .factory('requisitionGroupService', service);

    service.$inject = ['referencedataUrlFactory', '$resource'];

    function service(referencedataUrlFactory, $resource) {

        var resource = $resource(referencedataUrlFactory('/api/requisitionGroups/:id'), {}, {
            getAll: {
                url: referencedataUrlFactory('/api/requisitionGroups'),
                method: 'GET',
                isArray: true
            },
            search: {
                url: referencedataUrlFactory('/api/requisitionGroups/search'),
                method: 'POST'
            }
        });

        return {
            get: get,
            getAll: getAll,
            search: search
        };

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.requisitionGroupService
         * @name get
         *
         * @description
         * Gets Requisition Group by id.
         *
         * @param  {String}  id Requisition Group UUID
         * @return {Promise}    Requisition Group info
         */
        function get(id) {
            return resource.get({
                id: id
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.requisitionGroupService
         * @name getAll
         *
         * @description
         * Gets all Requisition Groups.
         *
         * @return {Promise} Array of all programs
         */
        function getAll() {
            return resource.getAll().$promise;
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.requisitionGroupService
         * @name search
         *
         * @description
         * Searches Requisition Groups using given parameters.
         *
         * @param  {Object}  paginationParams the pagination parameters
         * @param  {Object}  queryParams      the search parameters
         * @return {Promise}                  the requested page of filtered requisition groups.
         */
        function search(paginationParams, queryParams) {
            return resource.search(paginationParams, queryParams).$promise;
        }
    }
})();
