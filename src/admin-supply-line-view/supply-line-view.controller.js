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
     * @name admin-supply-line-view.controller:SupplyLineViewController
     *
     * @description
     * Controller for managing supply line view screen.
     */
    angular
        .module('admin-supply-line-view')
        .controller('SupplyLineViewController', controller);

    controller.$inject = ['supplyLine'];

    function controller(supplyLine) {

        var vm = this;

        vm.$onInit = onInit;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-view.controller:SupplyLineViewController
         * @name supplyLine
         * @type {Object}
         *
         * @description
         * Contains supply line object.
         */
        vm.supplyLine = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-view.controller:SupplyLineViewController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating SupplyLineViewController.
         */
        function onInit() {
            vm.supplyLine = supplyLine;
        }
    }
})();
