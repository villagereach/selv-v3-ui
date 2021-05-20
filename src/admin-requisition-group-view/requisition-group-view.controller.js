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
     * @name admin-requisition-group-view.controller:RequisitionGroupViewController
     *
     * @description
     * Controller for managing requisition group view screen.
     */
    angular
        .module('admin-requisition-group-view')
        .controller('RequisitionGroupViewController', controller);

    controller.$inject = ['$state', '$stateParams', 'requisitionGroup', 'memberFacilities', 'facilities',
        'facilityService', 'notificationService', 'requisitionGroupService', 'loadingModalService',
        'confirmService', 'stateTrackerService', 'facilityFactory'];

    function controller($state, $stateParams, requisitionGroup, memberFacilities, facilities, facilityService,
                        notificationService, requisitionGroupService, loadingModalService, confirmService,
                        stateTrackerService, facilityFactory) {

        var vm = this;

        vm.$onInit = onInit;
        vm.searchForFacilities = searchForFacilities;
        vm.selectedFacility = undefined;
        vm.addFacility = addFacility;
        vm.save = save;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name requisitionGroup
         * @type {Object}
         *
         * @description
         * Contains requisition group object.
         */
        vm.requisitionGroup = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name facilityName
         * @type {String}
         *
         * @description
         * Contains requisition group object.
         */
        vm.facilityName = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name memberFacilities
         * @type {Array}
         *
         * @description
         * Contains paginated list of all requisition group associated facilities.
         */
        vm.memberFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name memberFacilitiesPage
         * @type {Array}
         *
         * @description
         * Contains current page of associated facilities.
         */
        vm.memberFacilitiesPage = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name selectedType
         * @type {Number}
         *
         * @description
         * Contains number of currently selected tab.
         */
        vm.selectedType = undefined;

        // SELV3-337: Added the ability to add facility to the requisition group
        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @type {Array}
         * @name facilities
         *
         * @description
         * The map of facility names by ids.
         */
        vm.facilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name allMemeberFacilities
         * @type {Array}
         *
         * @description
         * Contains paginated list of all requisition group associated facilities regardless of the filter.
         */
        vm.allMemeberFacilities = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating RequisitionGroupViewController.
         */
        function onInit() {
            vm.requisitionGroup = requisitionGroup;
            vm.memberFacilities = memberFacilities;
            vm.facilityName = $stateParams.facilityName;
            vm.selectedTab = $stateParams.tab ? parseInt($stateParams.tab) : 0;
            vm.facilities = facilities;
            vm.allMemeberFacilities = facilityFactory.searchAndOrderFacilities(
                vm.requisitionGroup.memberFacilities, undefined, 'name'
            );
        }

        /**
         * @ngdoc method
         * @methodOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name addFacility
         *
         * @description
         * Adds facility.
         *
         * @return {Promise} the promise resolving to the added facility.
         */
        function addFacility() {
            var errorMessage = validateFacility();
            if (errorMessage) {
                notificationService.error(errorMessage);
            } else {
                facilityService.get(vm.selectedFacility.id)
                    .then(function(facility) {
                        vm.allMemeberFacilities.push(facility);
                        refreshStateParams();
                    });
            }
        }

        function validateFacility() {
            var facility = _.findWhere(vm.allMemeberFacilities, {
                id: vm.selectedFacility.id
            });

            if (facility) {
                return 'adminRequisitionGroupView.facilityAlreadyAdded';
            }
        }

        function refreshStateParams() {
            vm.requisitionGroup.memberFacilities = vm.allMemeberFacilities;

            vm.memberFacilities = facilityFactory.searchAndOrderFacilities(
                vm.requisitionGroup.memberFacilities, vm.facilityName, 'name'
            );

            $stateParams.requisitionGroup = vm.requisitionGroup;
            return $state.go('openlmis.administration.requisitionGroupView', $stateParams);
        }

        /**
         * @ngdoc method
         * @methodOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name save
         *
         * @description
         * Saves the requisition group and takes user back to the previous state.
         */
        function save() {
            confirmService.confirm('adminRequisitionGroupView.save.question', 'adminRequisitionGroupView.save')
                .then(function() {
                    var loadingPromise = loadingModalService.open();
                    requisitionGroupService.update(vm.requisitionGroup)
                        .then(function() {
                            loadingPromise.then(function() {
                                notificationService.success('adminRequisitionGroupView.save.success');
                            });
                            stateTrackerService.goToPreviousState('openlmis.administration.requisitionGroupList');
                        })
                        .catch(function() {
                            loadingModalService.close();
                            notificationService.error('adminRequisitionGroupView.save.fail');
                        });
                });
        }
        // SELV3-337: ends here
        /**
         * @ngdoc method
         * @methodOf admin-requisition-group-view.controller:RequisitionGroupViewController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function searchForFacilities() {
            var stateParams = angular.copy($stateParams);

            stateParams.facilityName = vm.facilityName;
            stateParams.tab = 1;
            stateParams.requisitionGroup = vm.requisitionGroup;

            $state.go('openlmis.administration.requisitionGroupView', stateParams, {
                reload: true
            });
        }
    }
})();