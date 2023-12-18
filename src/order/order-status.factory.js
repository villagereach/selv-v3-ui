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
     * @name order.orderStatusFactory
     *
     * @description
     * Translates different order statuses for display in dropdowns.
     */
    angular
        .module('order')
        .factory('orderStatusFactory', factory);

    factory.$inject = ['messageService', 'ORDER_STATUSES'];

    function factory(messageService, ORDER_STATUSES) {
        var factory = {
            getAll: getAll
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf order.orderStatusFactory
         * @name getAll
         *
         * @description
         * Returns list of order statuses.
         */
        function getAll() {
            return [
                {
                    name: messageService.get('orderStatus.ORDERED'),
                    value: ORDER_STATUSES.ORDERED
                },
                {
                    name: messageService.get('orderStatus.FULFILLING'),
                    value: ORDER_STATUSES.FULFILLING
                },
                {
                    name: messageService.get('orderStatus.SHIPPED'),
                    value: ORDER_STATUSES.SHIPPED
                },
                {
                    name: messageService.get('orderStatus.RECEIVED'),
                    value: ORDER_STATUSES.RECEIVED
                },
                {
                    name: messageService.get('orderStatus.TRANSFER_FAILED'),
                    value: ORDER_STATUSES.TRANSFER_FAILED
                },
                {
                    name: messageService.get('orderStatus.CREATING'),
                    value: ORDER_STATUSES.CREATING
                }
            ];
        }
    }

})();