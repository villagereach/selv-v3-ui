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
     * @name requisition-order-volume.requisitionOrderVolumeService
     *
     * @description
     * Service allows to display alert modal with custom message.
     */
    angular
        .module('requisition-order-volume')
        .service('requisitionOrderVolumeService', requisitionOrderVolumeService);

    requisitionOrderVolumeService.$inject = [
        'calculationFactory'
    ];

    function requisitionOrderVolumeService(calculationFactory) {

        this.getRequisitionOrderVolume = getRequisitionOrderVolume;

        /**
         * @ngdoc method
         * @name getRequisitionOrderVolume
         * @methodOf requisition-order-volume.requisitionOrderVolumeService
         *
         * @description
         * Calculates order volume of all line items. This method will ignore skipped line items
         * and line items that not require cooling.
         *
         * @return {Number} the order volume of all line items
         */
        function getRequisitionOrderVolume(requisition) {
            var sum = 0;

            getLineItems(requisition).forEach(function(lineItem) {
                if (!lineItem.skipped && isNeedCooling(lineItem.orderable)) {
                    sum += calculateTotalVolume(lineItem, requisition);
                }
            });
            return sum / 1000;
        }

        function calculateTotalVolume(lineItem, requisition) {
            var packsToShip = calculationFactory.packsToShip(lineItem, requisition);
            var netContent = lineItem.orderable.netContent ? lineItem.orderable.netContent : 0;
            var volume = lineItem.orderable.inBoxCubeDimension ? lineItem.orderable.inBoxCubeDimension.value : 0;
            return packsToShip * netContent * volume;
        }

        function getLineItems(requisition) {
            return requisition.requisitionLineItems;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-order-volume.controller:RequisitionOrderVolumeController
         * @name isNeedCooling
         *
         * @description
         * Checks if specific orderable needs cooling
         *
         * @return {Boolean} true if orderable needs cooling
         */
        function isNeedCooling(orderable) {
            return orderable.inBoxCubeDimension &&
            orderable.maximumTemperature &&
            orderable.maximumTemperature.value <= 8;
        }
    }
})();
