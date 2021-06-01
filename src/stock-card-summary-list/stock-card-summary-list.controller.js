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
     * @ngdoc controller
     * @name stock-card-summary-list.controller:StockCardSummaryListController
     *
     * @description
     * Controller responsible displaying Stock Card Summaries.
     */
    angular
        .module('stock-card-summary-list')
        .controller('StockCardSummaryListController', controller);

    controller.$inject = [
        'loadingModalService', '$state', '$stateParams', 'StockCardSummaryRepositoryImpl', 'stockCardSummaries',
        'accessTokenFactory', '$window', 'openlmisUrlFactory', 'offlineService', '$scope'
    ];

    function controller(loadingModalService, $state, $stateParams, StockCardSummaryRepositoryImpl,
                        stockCardSummaries, accessTokenFactory, $window, openlmisUrlFactory,
                        offlineService, $scope) {
        var vm = this;

        vm.$onInit = onInit;
        vm.loadStockCardSummaries = loadStockCardSummaries;
        vm.viewSingleCard = viewSingleCard;
        vm.print = print;
        vm.offline = offlineService.isOffline;
        vm.goToPendingOfflineEventsPage = goToPendingOfflineEventsPage;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name stockCardSummaries
         * @type {Array}
         *
         * @description
         * List of Stock Card Summaries.
         */
        vm.stockCardSummaries = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name displayStockCardSummaries
         * @type {Array}
         *
         * @description
         *  Holds current display list of Stock Card Summaries.
         */
        vm.displayStockCardSummaries = undefined;

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name getStockSummaries
         *
         * @description
         * Initialization method for StockCardSummaryListController.
         */
        function onInit() {
            vm.stockCardSummaries = stockCardSummaries;
            vm.displayStockCardSummaries = angular.copy(stockCardSummaries);

            $scope.$watchCollection(function() {
                return vm.pagedList;
            }, function(newList) {
                if (vm.offline()) {
                    vm.displayStockCardSummaries = newList;
                }
            }, true);
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name loadStockCardSummaries
         *
         * @description
         * Responsible for retrieving Stock Card Summaries based on selected program and facility.
         */
        function loadStockCardSummaries() {
            var stateParams = angular.copy($stateParams);

            stateParams.facility = vm.facility.id;
            stateParams.program = vm.program.id;
            stateParams.supervised = vm.isSupervised;

            $state.go('openlmis.stockmanagement.stockCardSummaries', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name viewSingleCard
         *
         * @description
         * Go to the clicked stock card's page to view its details.
         *
         * @param {sting} stockCardId the Stock Card UUID
         */
        function viewSingleCard(stockCardId) {
            $state.go('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                stockCardId: stockCardId
            });
        }

        /**
         *
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name print
         *
         * @description
         * Print SOH summary of current selected program and facility.
         */
        function print() {
            loadingModalService.open();
            var popup = $window.open('', '_blank');
            popup.location.href = accessTokenFactory.addAccessToken(getPrintUrl(vm.program.id, vm.facility.id));
            loadingModalService.close();
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name goToPendingOfflineEventsPage
         *
         * @description
         * Takes the user to the pending offline events page.
         */
        function goToPendingOfflineEventsPage() {
            $state.go('openlmis.pendingOfflineEvents');
        }

        function getPrintUrl(programId, facilityId) {
            return openlmisUrlFactory('/api/reports/templates/common/7d37ec81-a24d-402c-bd2d-3e37f43d7c2d/pdf?'
            + 'programId=' + programId + '&facilityId=' + facilityId);
        }
    }
})();
