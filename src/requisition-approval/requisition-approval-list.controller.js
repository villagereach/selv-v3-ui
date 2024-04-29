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
     * @name requisition-approval.controller:RequisitionApprovalListController
     *
     * @description
     * Controller for approval list of requisitions.
     */

    angular
        .module('requisition-approval')
        .controller('RequisitionApprovalListController', controller);

    controller.$inject = [
        '$state', 'requisitions', '$stateParams', 'programs', 'selectedProgram', 'alertService', 'offlineService',
        'localStorageFactory', 'isBatchApproveScreenActive', 'processingSchedules', 'selectedProcessingSchedule',
        'facilities', 'selectedFacility', 'periodService', '$scope', '$filter'
    ];

    function controller($state, requisitions, $stateParams, programs, selectedProgram, alertService, offlineService,
                        localStorageFactory, isBatchApproveScreenActive, processingSchedules,
                        selectedProcessingSchedule, facilities, selectedFacility, periodService, $scope, $filter) {

        var vm = this,
            offlineRequisitions = localStorageFactory('requisitions');

        vm.$onInit = onInit;
        vm.search = search;
        vm.openRnr = openRnr;
        vm.toggleSelectAll = toggleSelectAll;
        vm.viewSelectedRequisitions = viewSelectedRequisitions;
        vm.isFullRequisitionAvailable = isFullRequisitionAvailable;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name requisitions
         * @type {Array}
         *
         * @description
         * Holds requisition that will be displayed on screen.
         */
        vm.requisitions = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name programs
         * @type {Array}
         *
         * @description
         * List of programs to which user has access based on his role/permissions.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name selectedProgram
         * @type {Object}
         *
         * @description
         * The program selected by the user.
         */
        vm.selectedProgram = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name programs
         * @type {Array}
         *
         * @description
         * List of programs to which user has access based on his role/permissions.
         */
        vm.facilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name selectedProgram
         * @type {Object}
         *
         * @description
         * The program selected by the user.
         */
        vm.selectedFacility = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name programs
         * @type {Array}
         *
         * @description
         * List of programs to which user has access based on his role/permissions.
         */
        vm.processingSchedules = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name selectedProgram
         * @type {Object}
         *
         * @description
         * The program selected by the user.
         */
        vm.selectedProcessingSchedule = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name programs
         * @type {Array}
         *
         * @description
         * List of programs to which user has access based on his role/permissions.
         */
        vm.processingPeriods = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name selectedProgram
         * @type {Object}
         *
         * @description
         * The program selected by the user.
         */
        vm.selectedProcessingPeriod = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name offline
         * @type {Boolean}
         *
         * @description
         * Indicates if requisitions will be searched offline or online.
         */
        vm.offline = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name isBatchApproveScreenActive
         * @type {boolean}
         *
         * @description
         * Indicates if Batch Approve screen is active.
         */
        vm.isBatchApproveScreenActive = undefined;

        vm.options = {
            'requisitionApproval.newestAuthorized': ['emergency,desc', 'authorizedDate,desc'],
            'requisitionApproval.oldestAuthorized': ['emergency,desc', 'authorizedDate,asc']
        };

        /**
         * @ngdoc method
         * @methodOf requisition-approval.controller:RequisitionApprovalListController
         * @name $onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */
        function onInit() {
            fetchProcessingPeriods();

            vm.requisitions = requisitions;
            vm.programs = programs;
            vm.selectedProgram = selectedProgram;
            vm.facilities = facilities;
            vm.selectedFacility = selectedFacility;
            vm.processingSchedules = processingSchedules;
            vm.selectedProcessingSchedule = selectedProcessingSchedule;
            if (vm.processingPeriods) {
                vm.selectedProcessingPeriod = $filter('filter')(vm.processingPeriods.$$state.value.content, {
                    id: $stateParams.processingPeriod
                })[0];
            }
            vm.offline = $stateParams.offline === 'true' || offlineService.isOffline();
            vm.isBatchApproveScreenActive = isBatchApproveScreenActive;

            $scope.$watch('vm.selectedProcessingSchedule', function() {
                fetchProcessingPeriods();
            });

            $scope.$watch('vm.processingPeriods.$$state.value.content', function() {
                if ($stateParams.processingPeriod) {
                    vm.selectedProcessingPeriod = $filter('filter')(vm.processingPeriods.$$state.value.content, {
                        id: $stateParams.processingPeriod
                    })[0];
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-approval.controller:RequisitionApprovalListController
         * @name search
         *
         * @description
         * Searches requisitions by criteria selected in form.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.program = vm.selectedProgram ? vm.selectedProgram.id : null;
            stateParams.facility = vm.selectedFacility ? vm.selectedFacility.id : null;
            stateParams.processingSchedule = vm.selectedProcessingSchedule ? vm.selectedProcessingSchedule.id : null;
            stateParams.processingPeriod = vm.selectedProcessingPeriod ? vm.selectedProcessingPeriod.id : null;
            stateParams.offline = vm.offline;

            $state.go('openlmis.requisitions.approvalList', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-approval.controller:RequisitionApprovalListController
         * @name openRnr
         *
         * @description
         * Redirects to requisition page with given requisition UUID.
         */
        // SELV3-126: Increases pagination size of requisition forms from 10 to 25 items
        function openRnr(requisitionId) {
            $state.go('openlmis.requisitions.requisition.fullSupply', {
                rnr: requisitionId,
                fullSupplyListSize: 25
            });
        }
        // SELV3-126: ends here

        /**
         * @ngdoc method
         * @methodOf requisition-approval.controller:RequisitionApprovalListController
         * @name toggleSelectAll
         *
         * @description
         * Responsible for marking/unmarking all requisitions as selected.
         *
         * @param {Boolean} selectAll Determines if all requisitions should be selected or not
         */
        function toggleSelectAll(selectAll) {
            angular.forEach(vm.requisitions, function(requisition) {
                requisition.$selected = selectAll;
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-approval.controller:RequisitionApprovalListController
         * @name viewSelectedRequisitions
         *
         * @description
         * Redirects to page for modifying all selected requisitions.
         */
        function viewSelectedRequisitions() {
            var selectedRequisitionIds = [],
                requisitionsFromOneProgram = true,
                requiredProgramId;

            angular.forEach(vm.requisitions, function(requisition) {
                if (requisition.$selected) {
                    if (requiredProgramId && requisition.program.id !== requiredProgramId) {
                        requisitionsFromOneProgram = false;
                    }
                    selectedRequisitionIds.push(requisition.id);
                    requiredProgramId = requisition.program.id;
                }
            });

            if (selectedRequisitionIds.length > 0 && requisitionsFromOneProgram) {
                $state.go('openlmis.requisitions.batchApproval', {
                    ids: selectedRequisitionIds.join(',')
                });
            } else if (requisitionsFromOneProgram) {
                alertService.error('requisitionApproval.selectAtLeastOneRnr');
            } else {
                alertService.error('requisitionApproval.selectRequisitionsFromTheSameProgram');
            }
        }

        /**
         * @ngdoc method
         * @methodOf requisition-approval.controller:RequisitionApprovalListController
         * @name isFullRequisitionAvailable
         *
         * @description
         * Responsible for checking if local storage contains the given requisition.
         *
         * @param {Boolean} requisitionId Requisition that will be searched in storage
         */
        function isFullRequisitionAvailable(requisitionId) {
            var offlineRequisition = offlineRequisitions.search({
                id: requisitionId
            });
            return !vm.offline || vm.offline && offlineRequisition.length > 0;
        }

        function fetchProcessingPeriods() {
            if (vm.selectedProcessingSchedule) {
                vm.processingPeriods = periodService.query({
                    processingScheduleId: vm.selectedProcessingSchedule.id,
                    size: 9999
                });
            }
        }
    }

})();
