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
// SELV3-346 Starts here
(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name admin-valid-source-list.controller:ValidSourceListController
     *
     * @description
     * Controller for managing valid sources list screen.
     */
    angular
        .module('admin-valid-source-list')
        .controller('ValidSourceListController', controller);

    controller.$inject = [
        'validSources', 'facilityTypesMap', 'programsMap', 'geographicZonesMap',
        'geographicLevelMap', 'programs', 'facilities', '$stateParams', '$state'
    ];

    function controller(validSources, facilityTypesMap, programsMap,
                        geographicZonesMap, geographicLevelMap, programs,
                        facilities, $stateParams, $state) {

        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;

        /**
         * @ngdoc method
         * @methodOf admin-valid-source-list.controller:ValidSourceListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.programId = vm.programId;
            stateParams.facilityId = vm.facilityId;

            $state.go('openlmis.administration.validSource', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc property
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @name facilityId
         * @type {String}
         *
         * @description
         * Id of facility selected in for filtering
         */
        vm.facilityId = null;

        /**
         * @ngdoc property
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @name programId
         * @type {String}
         *
         * @description
         * Id of program selected in for filtering
         */
        vm.programId = null;

        /**
         * @ngdoc property
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @name validSources
         * @type {Array}
         *
         * @description
         * Contains filtered validSources.
         */
        vm.validSources = [];

        /**
         * @ngdoc property
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @name facilities
         * @type {Array}
         *
         * @description
         * Facilities available for filtering
         */
        vm.facilities = [];

        /**
         * @ngdoc property
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Programs available for filtering
         */
        vm.programs = [];

        /**
         * @ngdoc property
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @type {Array}
         * @name facilityTypesMap
         *
         * @description
         * The map of facility type names by ids.
         */
        vm.facilityTypesMap = [];

        /**
           * @ngdoc property
           * @propertyOf admin-valid-source-list.controller:ValidSourceListController
           * @type {Object}
           * @name programsMap
           *
           * @description
           * The map of program names by ids.
           */
        vm.programsMap = {};

        /**
           * @ngdoc property
           * @propertyOf admin-valid-source-list.controller:ValidSourceListController
           * @type {Object}
           * @name geographicZonesMap
           *
           * @description
           * The map of geographic zones names by ids.
           */
        vm.geographicZonesMap = {};

        /**
         * @ngdoc property
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @type {Array}
         * @name geographicLevelMap
         *
         * @description
         * The map of geographic levels zones names by ids.
         */
        vm.geographicLevelMap = [];

        // SELV3-343: Add possibility to add valid sources
        /**
         * @ngdoc method
         * @propertyOf admin-valid-source-list.controller:ValidSourceListController
         * @name openAddValidSourceModal
         *
         * @description
         * Takes the user to the add facility page.
         */
        vm.openAddValidSourceModal = function() {
            $state.go('openlmis.administration.validSource.add');
        };
        // SELV3-343: Ends here

        /**
         * @ngdoc method
         * @methodOf admin-valid-source-list.controller:ValidSourceListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating ValidSourceListController.
         */
        function onInit() {
            vm.validSources = validSources;
            vm.programsMap = programsMap;
            vm.facilityTypesMap = facilityTypesMap;
            vm.geographicZonesMap = geographicZonesMap;
            vm.geographicLevelMap = geographicLevelMap;
            vm.programs = programs;
            vm.facilities = facilities;
            vm.facilityId = $stateParams.facilityId;
            vm.programId = $stateParams.programId;
        }
    }
})();
// SELV3-346 Ends here