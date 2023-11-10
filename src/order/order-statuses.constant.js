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
// SELV3-229: Translate Requisition and Order Status
(function() {

    'use strict';

    /**
     * @ngdoc object
     * @name order.ORDER_STATUSES
     *
     * @description
     * Contains all possible order statuses.
     */
    angular
        .module('order')
        .provider('ORDER_STATUSES', orderStatusProvider);

    function orderStatusProvider() {
        this.$get = ['messageService', function(messageService) {
            return statuses(messageService);
        }];
    }

    function statuses(messageService) {
        var ORDER_STATUSES = {
                ORDERED: 'ORDERED',
                RECEIVED: 'RECEIVED',
                SHIPPED: 'SHIPPED',
                FULFILLING: 'FULFILLING',
                TRANSFER_FAILED: 'TRANSFER_FAILED',
                getLabel: getLabel,
                getStatusMessage: getStatusMessage,
                getStatuses: getStatuses
            },
            labels = {
                ORDERED: 'order.status.ordered',
                RECEIVED: 'order.status.received',
                SHIPPED: 'order.status.shipped',
                FULFILLING: 'order.status.fulfilling',
                TRANSFER_FAILED: 'order.status.transfer_failed'
            };

        return ORDER_STATUSES;

        /**
         * @ngdoc method
         * @methodOf order.ORDER_STATUSES
         * @name getLabel
         *
         * @description
         * Returns the label for the given status.
         *
         * @param   {String}    status  the status to get the label for
         * @return  {String}            the label for the given status
         */
        function getLabel(status) {
            var label = labels[status];

            if (!label) {
                throw 'Invalid status';
            }

            return label;
        }

        /**
         * @ngdoc method
         * @methodOf order.ORDER_STATUSES
         * @name getLabel
         *
         * @description
         * Returns the label for the given status.
         *
         * @param   {String}    status  the status to get the message for
         * @return  {String}            the message for given status
         */
        function getStatusMessage(status) {
            var message = messageService.get(getLabel(status));
            var regex = new RegExp('^order.status.*');

            if (regex.test(message)) {
                return ORDER_STATUSES[status];
            }
            return message;
        }

        /**
         * @ngdoc method
         * @methodOf order.ORDER_STATUSES
         * @name getStatuses
         *
         * @description
         * Returns all the statuses as a list.
         *
         * @return  {Array} the list of all statuses
         */
        function getStatuses() {
            return [
                ORDER_STATUSES.ORDERED,
                ORDER_STATUSES.RECEIVED,
                ORDER_STATUSES.SHIPPED,
                ORDER_STATUSES.FULFILLING,
                ORDER_STATUSES.TRANSFER_FAILED
            ];
        }
    }

})();
// SELV3-229: Ends here