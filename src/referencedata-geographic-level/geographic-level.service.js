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

    angular
        .module('referencedata-geographic-level')
        .service('GeographicLevelService', GeographicLevelService);

    /**
     * @ngdoc constant
     * @name referencedata-geographic-level.constant:GEOGRAPHIC_LEVEL
     * 
     * @description
     * This constant provides the geographic level number.
     */
    var GEOGRAPHIC_LEVEL = {
        NATIONAL: 1,
        PROVINCE: 2,
        DISTRICT: 3,
        HEALTH_AREA: 4
    };

    function GeographicLevelService() {
        return {
            /**
             * @ngdoc function
             * @name referencedata-geographic-level.service:getTheLowestLevelNumber
             * 
             * @description
             * This function returns the lowest level number. Lowest in this case means the most detailed level.
             */
            getTheLowestLevelNumber: function() {
                return GEOGRAPHIC_LEVEL.HEALTH_AREA;
            }
        };
    }

})();
