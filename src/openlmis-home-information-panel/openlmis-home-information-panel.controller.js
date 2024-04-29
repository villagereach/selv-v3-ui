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

    angular
        .module('openlmis-home-information-panel')
        .controller('openlmisHomeInformationPanelController', controller);

    controller.$inject = ['$state', 'requisitionService', 'orderCreateService', 'localStorageService',
        'inventoryItemService', 'StockCardSummaryRepository', 'StockCardSummaryRepositoryImpl',
        'loadingModalService'];

    function controller($state, requisitionService, orderCreateService, localStorageService,
                        inventoryItemService, StockCardSummaryRepository, StockCardSummaryRepositoryImpl,
                        loadingModalService) {
        var vm = this;

        vm.redirectToRequisitionApprove = redirectToRequisitionApprove;
        vm.redirectToFulfillOrders = redirectToFulfillOrders;
        vm.redirectToPodManage = redirectToPodManage;

        vm.homeFacility = undefined;
        vm.numbersForApproval = undefined;
        vm.numbersOfOrders = undefined;
        vm.stockOnHandItems = [];
        vm.cceItems = [];

        vm.$onInit = onInit;

        function onInit() {
            loadingModalService.open();
            vm.homeFacility = JSON.parse(localStorageService.get('homeFacility'));
            vm.numbersForApproval = requisitionService.getNumbersForApproval();

            orderCreateService.numberOfOrdersData().then(function(fetchedData) {
                vm.numbersOfOrders = fetchedData;
            });

            fetchCCEInventory();
            fetchStockOnHand();
        }

        function fetchStockOnHand() {
            loadingModalService.open();
            var facilityPrograms = vm.homeFacility.supportedPrograms;

            angular.forEach(facilityPrograms, function(program) {
                var params = {
                    facilityId: vm.homeFacility.id,
                    programId: program.id,
                    stockOnHandSize: 5
                };
                new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl())
                    .query(params)
                    .then(function(stockCardSummary) {
                        angular.forEach(stockCardSummary.content, function(stockItem) {
                            var sohItems = stockItem.canFulfillForMe;
                            if (sohItems.length > 0) {
                                sohItems.sort(function(a, b) {
                                    new Date(a.processedDate) - new Date(b.processedDate);
                                });
                                var earliestDate = sohItems.length > 0 ? sohItems[0].processedDate : null;

                                vm.stockOnHandItems.push({
                                    name: stockItem.orderable.fullProductName,
                                    stockOnHand: stockItem.stockOnHand,
                                    firstExpiryDate: earliestDate
                                });
                            }
                        });
                    })
                    .then(function() {
                        loadingModalService.close();
                    });
            });

            return vm.stockOnHandItems;
        }

        function fetchCCEInventory() {
            var facilityPrograms = vm.homeFacility.supportedPrograms;

            angular.forEach(facilityPrograms, function(program) {
                var params = {
                    facilityId: vm.homeFacility.id,
                    programId: program.id,
                    cceItemsSize: 5
                };

                inventoryItemService.query(params).then(function(items) {
                    if (items.content.length) {
                        angular.forEach(items.content, function(item) {
                            vm.cceItems.push(item);
                        });
                    }
                });
            });

            return vm.cceItems;
        }

        function redirectToRequisitionApprove() {
            $state.go('openlmis.requisitions.approvalList');
        }

        function redirectToFulfillOrders() {
            $state.go('openlmis.orders.fulfillment');
        }

        function redirectToPodManage() {
            $state.go('openlmis.orders.podManage');
        }
    }
})();
