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
     * @name stock-physical-inventory-list.controller:PhysicalInventoryListController
     *
     * @description
     * Controller for managing physical inventory.
     */
    angular
        .module('stock-physical-inventory-list')
        .controller('PhysicalInventoryListController', controller);

    controller.$inject = ['facility', 'programs', 'drafts', 'messageService', '$state', 'physicalInventoryService',
        'FunctionDecorator', 'offlineService', '$q', '$scope', '$stateParams',
        'stockmanagementUrlFactory', 'accessTokenFactory', '$window'];

    function controller(facility, programs, drafts, messageService, $state, physicalInventoryService,
                        FunctionDecorator, offlineService, $q, $scope, $stateParams,
                        stockmanagementUrlFactory, accessTokenFactory, $window) {
        var vm = this;
        vm.$onInit = onInit;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds user's home facility.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds available programs for home facility.
         */
        vm.programs = programs;

        vm.drafts = drafts;
        vm.editDraft = new FunctionDecorator()
            .decorateFunction(editDraft)
            .withLoading(true)
            .getDecoratedFunction();

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name getProgramName
         *
         * @description
         * Responsible for getting program name based on id.
         *
         * @param {String} id Program UUID
         */
        vm.getProgramName = function(id) {
            return _.find(vm.programs, function(program) {
                return program.id === id;
            }).name;
        };

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name getDraftStatus
         *
         * @description
         * Responsible for getting physical inventory status.
         *
         * @param {Boolean} isStarter Indicates starter.
         * @param {Boolean} isDraft Indicates draft.
         */
        vm.getDraftStatus = function(isStarter, isDraft) {
            // SELV3-247 - Added posibility to view and print history Physical inventory
            // START
            if (isStarter) {
                return messageService.get('stockPhysicalInventory.notStarted');
            } else if (isDraft) {
                return messageService.get('stockPhysicalInventory.draft');
            }
            return messageService.get('stockPhysicalInventory.submitted');
            // SELV3-247 - Added posibility to view and print history Physical inventory
            // END
        };

        // SELV3-247 - Added posibility to view and print history Physical inventory
        // START

        /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name printHistoryDraft
     *
     * @description
     * Responsible for printing historical physical inventory.
     *
     * @param {Object} draft draft.
     */
        vm.printHistoryPhysicalInventory = function(draft) {
            $window.open(accessTokenFactory
                .addAccessToken(vm.getPrintUrl(draft.id)), '_blank');
        };

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name getPrintUrl
         *
         * @description
         * Prepares a print URL for the given physical inventory.
         *
         * @return {String} the prepared URL
         */
        vm.getPrintUrl = function(id) {
            return stockmanagementUrlFactory('/api/reports/templates/common/' +
                '968b4abc-ea64-4285-9f46-64544d8af37e/pdf?physInventoryId=' + id);
        };

        // SELV3-247 - Added posibility to view and print history Physical inventory
        // END

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name editDraft
         *
         * @description
         * Navigating to draft physical inventory.
         *
         * @param {Object} draft Physical inventory draft
         */
        function editDraft(draft) {
            $stateParams.stateOffline = setOfflineState();

            var program = _.find(vm.programs, function(program) {
                return program.id === draft.programId;
            });
            vm.drafts.forEach(function(item) {
                if (item.programId === draft.programId && draft.isStarter === true) {
                    item.isStarter = false;
                }
            });
            if (offlineService.isOffline() || draft.id) {
                $state.go('openlmis.stockmanagement.physicalInventory.draft', {
                    id: draft.id,
                    program: program,
                    facility: facility
                });
                return $q.resolve();
            }
            return physicalInventoryService.createDraft(program.id, facility.id).then(function(data) {
                draft.id = data.id;
                $state.go('openlmis.stockmanagement.physicalInventory.draft', {
                    id: draft.id,
                    program: program,
                    facility: facility
                });
            });
        }

        function onInit() {
            if (networkStateHasBeenChanged()) {
                reloadPage();
            }

            $scope.$watch(function() {
                return offlineService.isOffline();
            }, function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    reloadPage();
                }
            }, true);
        }

        function reloadPage() {
            $state.go('openlmis.stockmanagement.physicalInventory', {}, {
                reload: true
            });
        }

        function networkStateHasBeenChanged() {
            return $stateParams.stateOffline !== undefined &&
                $stateParams.stateOffline !== offlineService.isOffline();
        }

        function setOfflineState() {
            return offlineService.isOffline();
        }
    }
})();
