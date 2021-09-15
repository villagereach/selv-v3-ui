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
        'validSources', 'facilityTypesMap', 'programsMap', 'geographicZonesMap', 'geographicLevelMap'
    ];

    function controller(validSources, facilityTypesMap, programsMap, geographicZonesMap, geographicLevelMap) {

        var vm = this;

        vm.$onInit = onInit;

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
        }
    }
})();
// SELV3-346 Ends here