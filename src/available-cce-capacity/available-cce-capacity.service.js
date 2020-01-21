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
     * Service allows to display alert modal with custom message.
     */
    angular
        .module('available-cce-capacity')
        .service('availableCceCapacityService', availableCceCapacityService);

    availableCceCapacityService.$inject = [
        '$q', 'CceVolumeResource', 'StockCardSummaryResource'
    ];

    function availableCceCapacityService($q, CceVolumeResource, StockCardSummaryResource) {

        this.getFullCceVolume = getFullCceVolume;
        this.getCceVolumeInUse = getCceVolumeInUse;

        /**
         * @ngdoc method
         * @name getFullCceVolume
         * @methodOf available-cce-capacity.availableCceCapacityService
         *
         * @description
         * Calls CCE service for volume capacity of given facility.
         *
         * @param  {Object}  facilityId id of the facility requisition is created for
         * @return {Promise}            promise containing full CCE volume
         */
        function getFullCceVolume(facilityId) {
            return new CceVolumeResource().query({
                facilityId: facilityId
            })
                .then(function(response) {
                    return response.volume;
                });
        }

        /**
         * @ngdoc method
         * @name getCceVolumeInUse
         * @methodOf available-cce-capacity.availableCceCapacityService
         *
         * @description
         * 
         *
         * @param  {Object}  facilityId id of the facility requisition is created for
         * @return {Promise}            promise containing full CCE volume
         */
        function getCceVolumeInUse(requisition) {
            var cceOrderables = filterCceOrderablesFromRequisition(requisition),
                cceOrderablesIds = cceOrderables
                    .map(function(orderable) {
                        return orderable.id;
                    });

            if (!cceOrderablesIds || !cceOrderablesIds.length) {
                return $q.resolve(0);
            }
            return new StockCardSummaryResource().query({
                orderableId: cceOrderablesIds,
                facilityId: requisition.facility.id,
                programId: requisition.program.id,
                nonEmptyOnly: true
            })
                .then(function(response) {
                    return calculateVolumeInUse(response, getIdentityMap(cceOrderables));
                });
        }

        function filterCceOrderablesFromRequisition(requisition) {
            return requisition.requisitionLineItems
                .map(function(lineItem) {
                    return lineItem.orderable;
                })
                .concat(requisition.availableFullSupplyProducts)
                .concat(requisition.availableNonFullSupplyProducts)
                .filter(function(orderable) {
                    return isCceOrderable(orderable);
                });
        }

        function isCceOrderable(orderable) {
            return orderable.maximumToleranceTemperature &&
                orderable.minimumToleranceTemperature &&
                orderable.maximumToleranceTemperature.value <= 8;
        }

        function calculateVolumeInUse(summariesPage, orderablesMap) {
            var sum = 0;
            summariesPage.content.forEach(function(summary) {
                var orderable = orderablesMap[summary.orderable.id];
                sum += orderable ?
                    orderable.inBoxCubeDimension.value * summary.stockOnHand :
                    0;
            });
            return sum / 1000;
        }

        function getIdentityMap(orderables) {
            var map = {};
            orderables.forEach(function(orderable) {
                map[orderable.id] = orderable;
            });
            return map;
        }
    }
})();
