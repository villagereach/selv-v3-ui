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
     * @name referencedata-requisition-group.requisitionGroupService
     *
     * @description
     * Responsible for retrieving requisition groups from the server.
     */
    angular
        .module('referencedata-requisition-group')
        .factory('requisitionGroupService', service);

    service.$inject = ['referencedataUrlFactory', '$resource', '$q'];

    function service(referencedataUrlFactory, $resource, $q) {

        var resource = $resource(referencedataUrlFactory('/api/requisitionGroups/:id'), {}, {
            getAll: {
                url: referencedataUrlFactory('/api/requisitionGroups'),
                method: 'GET',
                isArray: true
            },
            search: {
                url: referencedataUrlFactory('/api/requisitionGroups/search'),
                method: 'POST'
            },
            // SELV3-337: Added the ability to add facility to the requisition group
            update: {
                method: 'PUT'
            }
            // SELV3-337: ends here
        });

        return {
            get: get,
            getAll: getAll,
            search: search,
            update: update
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

        // SELV3-337: Added the ability to add facility to the requisition group
        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.requisitionGroupService
         * @name update
         *
         * @description
         * Updates Requisition Group.
         *
         * @param  {Object}  requisitionGroup Requisition Group to be updated
         * @return {Promise}                  Updated Requisition Group
         */
        function update(requisitionGroup) {
            return resource.update({
                id: requisitionGroup.id
            }, requisitionGroup)
                .$promise
                .then(function(requisitionGroup) {
                    return requisitionGroup;
                })
                .catch(function() {
                    return $q.reject();
                });
        }
        // SELV3-337: ends here
    }
})();
