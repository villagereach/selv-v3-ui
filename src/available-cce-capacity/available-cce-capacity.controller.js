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
     * @name available-cce-capacity.controller:AvailableCceCapacityController
     *
     * @description
     * 
     */
    angular
        .module('available-cce-capacity')
        .controller('AvailableCceCapacityController', AvailableCceCapacityController);

    AvailableCceCapacityController.$inject = ['availableCceCapacityService'];

    function AvailableCceCapacityController(availableCceCapacityService) {
        var indicator = this;

        indicator.$onInit = onInit;

        /**
         * @ngdoc property
         * @propertyOf available-cce-capacity.controller:AvailableCceCapacityController
         * @name requisition
         * @type {Object}
         *
         * @description
         * Holds requisition object.
         */

        /**
         * @ngdoc property
         * @propertyOf available-cce-capacity.controller:AvailableCceCapacityController
         * @name availableVolume
         * @type {Number}
         *
         * @description
         * Holds value of available CCE volume.
         */
        indicator.availableVolume = undefined;

        /**
         * @ngdoc property
         * @propertyOf available-cce-capacity.controller:AvailableCceCapacityController
         * @name ready
         * @type {boolean}
         *
         * @description
         * True if available volume is calculated already.
         */
        indicator.ready = undefined;

        /**
         * @ngdoc property
         * @propertyOf available-cce-capacity.controller:AvailableCceCapacityController
         * @name failed
         * @type {boolean}
         *
         * @description
         * Indicates if error occurred while fetching data.
         */
        indicator.failed = undefined;

        /**
         * @ngdoc method
         * @methodOf available-cce-capacity.controller:AvailableCceCapacityController
         * @name $onInit
         *
         * @description
         * Initialization method of the AvailableCceCapacityController.
         */
        function onInit() {
            indicator.ready = false;
            indicator.failed = false;

            availableCceCapacityService.getAvailableCceVolume(indicator.requisition.facility.id)
                .then(function(availableVolume) {
                    indicator.availableVolume = availableVolume;
                    indicator.requisition.$availableCceCapacity = indicator.availableVolume;
                    indicator.ready = true;
                })
                .catch(function() {
                    indicator.failed = true;
                });
        }
    }
})();
