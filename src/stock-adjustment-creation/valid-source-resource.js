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

// SELV3-439 Fix “out of memory“ error on stock management issue page
(function() {

    'use strict';

    angular
        .module('stock-adjustment-creation')
        .factory('ValidSourceResource', ValidSourceResource);

    ValidSourceResource.inject = ['OpenlmisCachedResource', 'classExtender'];

    function ValidSourceResource(OpenlmisCachedResource, classExtender) {

        classExtender.extend(ValidSourceResource, OpenlmisCachedResource);

        function ValidSourceResource() {
            this.super('/api/validSources', 'validSources', {
                versioned: false
            });
        }

        return ValidSourceResource;
    }
})();
// SELV3-439 ends here