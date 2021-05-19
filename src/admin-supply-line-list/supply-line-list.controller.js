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
     * @name admin-supply-line-list.controller:SupplyLineListController
     *
     * @description
     * Controller for managing supply line list screen.
     */
    angular
        .module('admin-supply-line-list')
        .controller('SupplyLineListController', controller);

    controller.$inject = [
        '$state', '$stateParams', '$q', 'SupplyLineResource', 'supplyLines', 'supplyingFacilities', 'programs',
        'confirmService', 'loadingModalService', 'notificationService'
    ];

    function controller($state, $stateParams, $q, SupplyLineResource,
                        supplyLines, supplyingFacilities, programs, confirmService,
                        loadingModalService, notificationService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.showFacilityPopover = showFacilityPopover;
        //SELV3-340: deleteSupplyLine added
        vm.deleteSupplyLine = deleteSupplyLine;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name supplyLines
         * @type {Array}
         *
         * @description
         * Contains filtered supply lines.
         */
        vm.supplyLines = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name supplyingFacilities
         * @type {Array}
         *
         * @description
         * Contains list of all supplying facilities.
         */
        vm.supplyingFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Contains list of all programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name supplyingFacilityId
         * @type {string}
         *
         * @description
         * Contains supplying facility id param for searching supply lines.
         */
        vm.supplyingFacilityId = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name programId
         * @type {string}
         *
         * @description
         * Contains program id param for searching supply lines.
         */
        vm.programId = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating SupplyLineListController.
         */
        function onInit() {
            vm.supplyLines = supplyLines;
            vm.supplyingFacilities = supplyingFacilities;
            vm.programs = programs;
            vm.supplyingFacilityId = $stateParams.supplyingFacilityId;
            vm.programId = $stateParams.programId;
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.supplyingFacilityId = vm.supplyingFacilityId;
            stateParams.programId = vm.programId;

            $state.go('openlmis.administration.supplyLines', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name showFacilityPopover
         *
         * @description
         * Checks if member facilities popover should be shown.
         * 
         * @param   {Object}  supplyLine given supply line
         * @returns {boolean}            true if popover should be shown
         */
        function showFacilityPopover(supplyLine) {
            return supplyLine.supervisoryNode.requisitionGroup &&
                supplyLine.supervisoryNode.requisitionGroup.memberFacilities &&
                supplyLine.supervisoryNode.requisitionGroup.memberFacilities.length;
        }

        //SELV3-340: Delete Supply Line
        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name deleteSupplyLine
         *
         * @description
         * Checks if supply line should be deleted and deletes it.
         * 
         * @param   {Object}  supplyLine given supply line
         * @returns {boolean}            true if supply line should be deleted
         */
        function deleteSupplyLine(supplyLine) {
            return confirmService
                .confirmDestroy('adminSupplyLineList.delete.confirm', 'adminSupplyLineList.delete')
                .then(function() {
                    loadingModalService.open();
                    return new SupplyLineResource()
                        .delete(supplyLine);
                })
                .then(function() {
                    refreshState($stateParams);
                })
                .then(function() {
                    notificationService.success('adminSupplyLineList.supplyLineDeletedSuccessfully');
                })
                .catch(function(error) {
                    return $q.reject(error);
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name refreshState
         *
         * @description
         * Checks if page should be refreshed after deletion of the supply line and then refreshes it.
         * 
         * @param   {Parameters}  stateParams given state parameter
         */
        function refreshState(stateParams) {
            $state.go('openlmis.administration.supplyLines', stateParams, {
                reload: true
            });
            notificationService.success('adminSupplyLineList.pageHasBeenRefreshed');
        }
    }
})();