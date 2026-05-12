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
     * @name available-cce-capacity.availableCceCapacityService
     *
     * @description
     * Fetches the available CCE capacity for a facility from the stockmanagement
     * extension endpoint.
     */
    angular
        .module('available-cce-capacity')
        .service('availableCceCapacityService', availableCceCapacityService);

    availableCceCapacityService.$inject = ['$q', '$http', 'stockmanagementUrlFactory'];

    function availableCceCapacityService($q, $http, stockmanagementUrlFactory) {

        this.getAvailableCceVolume = getAvailableCceVolume;

        /**
         * @ngdoc method
         * @name getAvailableCceVolume
         * @methodOf available-cce-capacity.availableCceCapacityService
         *
         * @description
         * Calls the stockmanagement extension for the facility's available CCE capacity
         * (total - in use, in liters). The endpoint sums volume in use across all
         * programs at the facility.
         *
         * @param  {String}  facilityId  id of the facility the requisition is created for
         * @return {Promise}             promise resolving to available CCE capacity in liters
         */
        function getAvailableCceVolume(facilityId) {
            var deferred = $q.defer();
            var url = stockmanagementUrlFactory(
                '/api/stockCardSummaries/cce/capacity?facilityId=' + facilityId
            );

            $http.get(url)
                .then(function(response) {
                    deferred.resolve(response.data.availableVolume);
                })
                .catch(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }
    }
})();
