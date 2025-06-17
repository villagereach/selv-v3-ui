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
        '$q', 'CceVolumeResource', 'StockCardSummaryResource', 'programService', 'OrderableResource',
        'authorizationService', 'permissionService', 'STOCKMANAGEMENT_RIGHTS'
    ];

    function availableCceCapacityService(
        $q, CceVolumeResource, StockCardSummaryResource, programService, OrderableResource,
        authorizationService, permissionService, STOCKMANAGEMENT_RIGHTS
    ) {

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

        function hasStockCardViewRight(program, facility) {
            return permissionService.hasPermission(authorizationService.getUser().user_id, {
                right: STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW,
                programId: program,
                facilityId: facility
            })
                .then(function() {
                    return true;
                })
                .catch(function() {
                    return false;
                });
        }

        /**
         * @ngdoc method
         * @name getCceVolumeInUse
         * @methodOf available-cce-capacity.availableCceCapacityService
         *
         * @description
         * Gets used volume based on stock cards and orderables that require refrigeration.
         * Stock cards are retrieved for all programs.
         *
         * @param  {Object}  facilityId id of the facility requisition is created for
         * @return {Promise}            promise containing full CCE volume
         */
        function getCceVolumeInUse(facilityId) {
            return programService.getAll().then(function(programs) {
                var permissionChecks = programs.map(function(program) {
                    return hasStockCardViewRight(program.id, facilityId)
                        .then(function(hasRight) {
                            return hasRight ? program : null;
                        });
                });
                return $q.all(permissionChecks).then(function(programsWithAccess) {
                    var filteredPrograms = programsWithAccess.filter(Boolean);

                    return new OrderableResource().query()
                        .then(function(orderablePage) {
                            var cceOrderables = orderablePage.content.filter(function(orderable) {
                                    return isCceOrderable(orderable);
                                }),
                                cceOrderableIds = cceOrderables.map(function(orderable) {
                                    return orderable.id;
                                }),
                                stockCardsPromises = filteredPrograms.map(function(program) {
                                    var docId = program.id + '/' + facilityId + '/' +
                                        authorizationService.getUser().user_id;
                                    var params = {
                                        orderableId: cceOrderableIds,
                                        facilityId: facilityId,
                                        programId: program.id,
                                        nonEmptyOnly: true
                                    };
                                    return new StockCardSummaryResource().query(params, docId)
                                        .then(function(stockCardSummariesPage) {
                                            return stockCardSummariesPage;
                                        });
                                });

                            return $q.all(stockCardsPromises).then(function(stockCardSummaryPages) {
                                return calculateVolumeInUse(
                                    stockCardSummaryPages.flatMap(function(stockCardSummaryPage) {
                                        return stockCardSummaryPage.content;
                                    }),
                                    cceOrderables.reduce(function(map, orderable) {
                                        map[orderable.id] = orderable;
                                        return map;
                                    }, {})
                                );
                            });
                        });
                });
            });
        }

        function isCceOrderable(orderable) {
            return orderable.inBoxCubeDimension &&
                orderable.minimumTemperature &&
                orderable.maximumTemperature &&
                orderable.maximumTemperature.value <= 8;
        }

        function calculateVolumeInUse(stockCardSummaries, orderablesMap) {
            var sum = 0;
            stockCardSummaries.forEach(function(summary) {
                var orderable = orderablesMap[summary.orderable.id];
                sum += orderable ?
                    orderable.inBoxCubeDimension.value * summary.stockOnHand / 1000 :
                    0;
            });
            return sum;
        }
    }
})();
