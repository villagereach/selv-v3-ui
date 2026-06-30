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
     * @name admin-exchange-rate-add.controller:ExchangeRateAddController
     *
     * @description
     * Handles entering a new exchange rate from the modal and reloads the list on success.
     */
    angular
        .module('admin-exchange-rate-add')
        .controller('ExchangeRateAddController', ExchangeRateAddController);

    ExchangeRateAddController.$inject = [
        '$state',
        'loadingModalService',
        'notificationService',
        'stateTrackerService',
        'ExchangeRateResource'
    ];

    function ExchangeRateAddController(
        $state,
        loadingModalService,
        notificationService,
        stateTrackerService,
        ExchangeRateResource
    ) {
        var vm = this;

        vm.$onInit = onInit;
        vm.addRate = addRate;
        vm.goToPreviousState = stateTrackerService.goToPreviousState;

        /**
         * @ngdoc property
         * @propertyOf admin-exchange-rate-add.controller:ExchangeRateAddController
         * @name rate
         * @type {Number}
         *
         * @description
         * The rate value entered by the user.
         */
        vm.rate = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-exchange-rate-add.controller:ExchangeRateAddController
         * @name $onInit
         *
         * @description
         * Initializes the controller.
         */
        function onInit() {
            vm.rate = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf admin-exchange-rate-add.controller:ExchangeRateAddController
         * @name addRate
         *
         * @description
         * Creates the entered rate. The new rate becomes the current one; on success the exchange
         * rate list is reloaded so the header card and history refresh.
         */
        function addRate() {
            loadingModalService.open();

            new ExchangeRateResource().create({
                rate: vm.rate
            })
                .then(function() {
                    notificationService.success('adminExchangeRateAdd.create.success');
                    loadingModalService.close();
                    $state.go('openlmis.administration.exchangeRate', {}, {
                        reload: true
                    });
                })
                .catch(function(error) {
                    loadingModalService.close();
                    var message = error && error.data && error.data.message;
                    notificationService.error(message || 'adminExchangeRateAdd.create.failure');
                });
        }
    }
})();
