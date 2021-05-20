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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
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

    controller.$inject = ['$state', '$stateParams', 'requisitionGroup', 'memberFacilities'];

    function controller($state, $stateParams, requisitionGroup, memberFacilities) {

        var vm = this;

        vm.$onInit = onInit;
        vm.searchForFacilities = searchForFacilities;

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
        }

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

            $state.go('openlmis.administration.requisitionGroupView', stateParams, {
                reload: true
            });
        }
    }
})();