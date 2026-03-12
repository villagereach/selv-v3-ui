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
    'use-strict';

    angular
        .module('proof-of-delivery-manage')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('orderStatusFactory', decorator);
    }

    decorator.$inject = ['$delegate', 'messageService', 'ORDER_STATUSES'];

    function decorator($delegate, messageService, ORDER_STATUSES) {
        function getProofOfDeliveryStatuses() {
            return [
                {
                    name: messageService.get('orderStatus.RECEIVED'),
                    value: ORDER_STATUSES.RECEIVED
                },
                {
                    name: messageService.get('orderStatus.TRANSFER_FAILED'),
                    value: ORDER_STATUSES.TRANSFER_FAILED
                },
                {
                    name: messageService.get('orderStatus.SHIPPED'),
                    value: ORDER_STATUSES.SHIPPED
                },
                {
                    name: messageService.get('orderStatus.READY_TO_PACK'),
                    value: ORDER_STATUSES.READY_TO_PACK
                },
                {
                    name: messageService.get('orderStatus.IN_ROUTE'),
                    value: ORDER_STATUSES.IN_ROUTE
                }
            ];
        }

        $delegate.getProofOfDeliveryStatuses = getProofOfDeliveryStatuses;

        return $delegate;
    }

})();