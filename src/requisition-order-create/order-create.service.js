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
     * @name requisition-order-create.orderCreateService
     *
     * @description
     * Communicates with the /api/orders endpoint of the OpenLMIS server.
     */
    angular
        .module('requisition-order-create')
        .service('orderCreateService', service);

    service.$inject = ['$resource', 'openlmisUrlFactory'];

    function service($resource, openlmisUrlFactory) {

        var resource = $resource(openlmisUrlFactory('/api/orders/:id'), {}, {
            update: {
                method: 'PUT'
            },
            create: {
                url: openlmisUrlFactory('/api/orders/requisitionLess'),
                method: 'POST'
            },
            send: {
                url: openlmisUrlFactory('/api/orders/:id/requisitionLess/send'),
                method: 'PUT'
            },
            numberOfOrdersData: {
                url: openlmisUrlFactory('/api/orders/numberOfOrdersData'),
                method: 'GET'
            }
        });

        this.get = get;
        this.create = create;
        this.update = update;
        this.send = send;
        this.numberOfOrdersData = numberOfOrdersData;

        function get(orderId) {
            return resource.get({
                id: orderId
            }).$promise;
        }

        function create(orderId) {
            return resource.create(orderId).$promise;
        }

        function update(order) {
            return resource.update({
                id: order.id
            }, order).$promise;
        }

        function send(order) {
            return resource.send({
                id: order.id
            }, order).$promise;
        }

        function numberOfOrdersData() {
            return resource.numberOfOrdersData().$promise;
        }
    }
})();
