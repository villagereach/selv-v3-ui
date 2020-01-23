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
     * @name requisition-order-volume.controller:RequisitionOrderVolumeController
     *
     * @description
     * Responsible for display Requisition Order Volume.
     */
    angular
        .module('requisition-order-volume')
        .controller('RequisitionOrderVolumeController', controller);

    controller.$inject = ['$scope', 'requisitionOrderVolumeService'];

    function controller($scope, requisitionOrderVolumeService) {
        var vm = this;

        vm.calculateOrderVolume = calculateOrderVolume;

        /**
         * @ngdoc property
         * @propertyOf requisition-order-volume.controller:RequisitionOrderVolumeController
         * @name requisition
         * @type {Object}
         *
         * @description
         * The requisition to render the order volume for.
         */
        vm.requisition = $scope.requisition;

        /**
         * @ngdoc method
         * @methodOf requisition-order-volume.controller:RequisitionOrderVolumeController
         * @name calculateOrderVolume
         *
         * @description
         * Calculates order volume of all line items. This method will ignore skipped line items
         * and line items that not require cooling.
         *
         * @return {Number} the order volume of all line items
         */
        function calculateOrderVolume() {
            vm.requisition.$orderVolume = requisitionOrderVolumeService
                .getRequisitionOrderVolume(vm.requisition);
            checkOrderVolume();
            return vm.requisition.$orderVolume;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-order-volume.controller:RequisitionOrderVolumeController
         * @name checkOrderVolume
         *
         * @description
         * Checks if order volume filed is greater than available cce capacity
         * and saves $toLargeOrderVolume value to requisition object
         *
         */
        function checkOrderVolume() {
            if (vm.requisition && vm.requisition.$availableCceCapacity &&
                vm.requisition.$orderVolume &&
                vm.requisition.$availableCceCapacity < vm.requisition.$orderVolume) {
                vm.requisition.$toLargeOrderVolume = true;
            } else {
                vm.requisition.$toLargeOrderVolume = undefined;
            }
        }
    }

})();
