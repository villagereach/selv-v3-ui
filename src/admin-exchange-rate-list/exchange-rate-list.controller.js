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
     * @name admin-exchange-rate-list.controller:ExchangeRateListController
     *
     * @description
     * Exposes the current exchange rate and the full history to the exchange rate screen.
     */
    angular
        .module('admin-exchange-rate-list')
        .controller('ExchangeRateListController', controller);

    controller.$inject = ['currentRate', 'rates'];

    function controller(currentRate, rates) {

        var vm = this;
        vm.$onInit = onInit;

        /**
         * @ngdoc property
         * @propertyOf admin-exchange-rate-list.controller:ExchangeRateListController
         * @name currentRate
         * @type {Object}
         *
         * @description
         * The currently active exchange rate, or undefined when none has been entered.
         */
        vm.currentRate = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-exchange-rate-list.controller:ExchangeRateListController
         * @name rates
         * @type {Array}
         *
         * @description
         * The exchange rate history, newest first.
         */
        vm.rates = [];

        /**
         * @ngdoc property
         * @propertyOf admin-exchange-rate-list.controller:ExchangeRateListController
         * @name pagedRates
         * @type {Array}
         *
         * @description
         * The current page of the exchange rate history, filled by the pagination component.
         */
        vm.pagedRates = [];

        /**
         * @ngdoc method
         * @methodOf admin-exchange-rate-list.controller:ExchangeRateListController
         * @name $onInit
         *
         * @description
         * Initializes the controller with the resolved current rate and history.
         */
        function onInit() {
            vm.currentRate = currentRate;
            vm.rates = rates;
        }
    }

})();
