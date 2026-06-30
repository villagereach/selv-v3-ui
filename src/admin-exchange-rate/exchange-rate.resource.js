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
     * @name admin-exchange-rate.ExchangeRateResource
     *
     * @description
     * Communicates with the USD-MZM exchange rate REST endpoints exposed by the fulfillment
     * extension. Reads are open to any authenticated user; creating a rate requires the
     * EXCHANGE_RATE_MANAGE right (enforced server-side).
     */
    angular
        .module('admin-exchange-rate')
        .factory('ExchangeRateResource', ExchangeRateResource);

    ExchangeRateResource.$inject = ['OpenlmisResource', 'classExtender'];

    function ExchangeRateResource(OpenlmisResource, classExtender) {

        classExtender.extend(ExchangeRateResource, OpenlmisResource);

        return ExchangeRateResource;

        /**
         * @ngdoc method
         * @methodOf admin-exchange-rate.ExchangeRateResource
         * @name ExchangeRateResource
         * @constructor
         *
         * @description
         * Creates an instance of the ExchangeRateResource class pointing at the exchange rate
         * endpoint. The history endpoint returns a plain array (not a page), hence paginated:false;
         * the current rate is fetched with get('current').
         */
        function ExchangeRateResource() {
            this.super('/api/exchangeRates', {
                paginated: false
            });
        }

    }

})();
