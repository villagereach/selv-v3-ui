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
     * @ngdoc service
     * @name stock-adjustment-creation.sourceDestinationService
     *
     * @description
     * Responsible for fetching valid sources or destinations.
     */
    angular
        .module('stock-adjustment-creation')
        .service('sourceDestinationService', service);

    // SELV3-439 Fix “out of memory“ error on stock management issue page
    service.$inject = ['ValidSourceResource', 'ValidDestinationResource'];

    function service(ValidSourceResource, ValidDestinationResource) {
    // SELV3-439 ends here
        this.getSourceAssignments = getSourceAssignments;
        this.getDestinationAssignments = getDestinationAssignments;
        this.clearSourcesCache = clearSourcesCache;
        this.clearDestinationsCache = clearDestinationsCache;

        // SELV3-439 Fix “out of memory“ error on stock management issue page
        this.validSourceResource = new ValidSourceResource();
        this.validDestinationResource = new ValidDestinationResource();
        // SELV3-439 ends here

        function getSourceAssignments(programId, facilityId) {
            // SELV3-439 Fix “out of memory“ error on stock management issue page
            return this.validSourceResource.query({
                programId: programId,
                facilityId: facilityId
            }).then(
                function(validSourcesPage) {
                    return validSourcesPage;
                }
            );
            // SELV3-439 ends here

        }

        function getDestinationAssignments(programId, facilityId) {
            // SELV3-439 Fix “out of memory“ error on stock management issue page
            return this.validDestinationResource.query({
                programId: programId,
                facilityId: facilityId
            }).then(
                function(validDestinationsPage) {
                    return validDestinationsPage;
                }
            );
            // SELV3-439 ends here
        }

        function clearSourcesCache() {
            // SELV3-439 Fix “out of memory“ error on stock management issue page
            this.validSourceResource.deleteAll();
            // SELV3-439 ends here
        }

        function clearDestinationsCache() {
            // SELV3-439 Fix “out of memory“ error on stock management issue page
            this.validDestinationResource.deleteAll();
            // SELV3-439 ends here
        }
    }
})();
