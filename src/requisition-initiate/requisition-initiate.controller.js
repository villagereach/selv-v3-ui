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
     * @name requisition-initiate.controller:RequisitionInitiateController
     *
     * @description
     * Controller responsible for actions connected with displaying available periods and
     * initiating or navigating to an existing requisition.
     */
    angular
        .module('requisition-initiate')
        .controller('RequisitionInitiateController', RequisitionInitiateController);

    RequisitionInitiateController.$inject = [
        'requisitionService', '$state', 'loadingModalService', 'notificationService', 'REQUISITION_RIGHTS',
        'permissionService', 'authorizationService', '$stateParams', 'periods', 'canInitiateRnr', 'UuidGenerator'
    ];

    function RequisitionInitiateController(requisitionService, $state, loadingModalService, notificationService,
                                           REQUISITION_RIGHTS, permissionService, authorizationService, $stateParams,
                                           periods, canInitiateRnr, UuidGenerator) {

        var vm = this,
            uuidGenerator = new UuidGenerator(),
            key = uuidGenerator.generate();

        vm.$onInit = onInit;
        vm.loadPeriods = loadPeriods;
        vm.initRnr = initRnr;
        vm.periodHasRequisition = periodHasRequisition;
        vm.goToRequisition = goToRequisition;

        /**
         * @ngdoc property
         * @propertyOf requisition-initiate.controller:RequisitionInitiateController
         * @name emergency
         * @type {Boolean}
         *
         * @description
         * Holds a boolean indicating if the currently selected requisition type is standard or emergency
         */
        vm.emergency = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-initiate.controller:RequisitionInitiateController
         * @name periods
         * @type {List}
         *
         * @description
         * The list of all periods displayed in the table.
         */
        vm.periods = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-initiate.controller:RequisitionInitiateController
         * @name canInitiateRnr
         * @type {boolean}
         *
         * @description
         * True if user has permission to initiate requisition.
         */
        vm.canInitiateRnr = undefined;

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name $onInit
         *
         * @description
         * Initialization method of the RequisitionInitiateController controller.
         */
        function onInit() {
            vm.emergency = $stateParams.emergency === 'true';
            vm.periods = periods;
            vm.canInitiateRnr = canInitiateRnr;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name loadPeriods
         *
         * @description
         * Responsible for displaying and updating a grid, containing available periods for the
         * selected program, facility and type. It will set an error message if no periods have
         * been found for the given parameters. It will also filter out periods for which there
         * already exists a requisition with an AUTHORIZED, APPROVED, IN_APPROVAL or RELEASED
         * status.
         */
        function loadPeriods() {
            $state.go('openlmis.requisitions.initRnr', {
                supervised: vm.isSupervised,
                program: vm.program.id,
                facility: vm.facility.id,
                emergency: vm.emergency
            }, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name initRnr
         *
         * @description
         * Responsible for initiating a requisition for a specified period. If
         * creating the requisition is successful, then the user is sent to the
         * requisition view page. Otherwise an error message is shown.
         *
         * @param {Object} selectedPeriod a period to initiate or proceed with the requisition for
         */
        function initRnr(selectedPeriod) {
            var user = authorizationService.getUser();

            vm.error = '';

            loadingModalService.open();
            permissionService.hasPermission(user.user_id, {
                right: REQUISITION_RIGHTS.REQUISITION_CREATE,
                programId: vm.program.id,
                facilityId: vm.facility.id
            })
                .then(function() {
                    requisitionService.initiate(vm.facility.id, vm.program.id, selectedPeriod.id, vm.emergency, key)
                        .then(function(data) {
                            goToInitiatedRequisition(data);
                        })
                        .catch(function() {
                            notificationService.error('requisitionInitiate.couldNotInitiateRequisition');
                            loadingModalService.close();
                            key = uuidGenerator.generate();
                        });
                })
                .catch(function() {
                    notificationService.error('requisitionInitiate.noPermissionToInitiateRequisition');
                    loadingModalService.close();
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name periodHasRequisition
         *
         * @description
         * Checks a period object to make sure no requisition is associated with
         * the period.
         *
         * @param {Object} period a period to check if it has a requisition
         */
        function periodHasRequisition(period) {
            if (period.rnrId) {
                return true;
            }
            return false;

        }

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name goToRequisition
         *
         * @description
         * Directs a user to the requisition view data for a specific period
         *
         * @param {Object} id A requisition id
         */
        function goToRequisition(id) {
            $state.go('openlmis.requisitions.requisition.fullSupply', {
                rnr: id
            });
        }

        function goToInitiatedRequisition(requisition) {
            $state.go('openlmis.requisitions.requisition.fullSupply', {
                rnr: requisition.id,
                requisition: requisition
            });
        }
    }
})();
