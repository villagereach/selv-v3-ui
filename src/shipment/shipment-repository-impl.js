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
     * @name shipment.ShipmentRepositoryImpl
     *
     * @description
     * Default implementation of the ShipmentRepository interface. Responsible for combining server
     * responses into single object to be passed to the Shipment class constructor.
     */
    angular
        .module('shipment')
        .factory('ShipmentRepositoryImpl', ShipmentRepositoryImpl);

    ShipmentRepositoryImpl.$inject = [
        'ShipmentResource', 'ShipmentDraftResource', 'OrderResource', 'StockCardSummaryRepositoryImpl'
    ];

    function ShipmentRepositoryImpl(ShipmentResource, ShipmentDraftResource, OrderResource,
                                    StockCardSummaryRepositoryImpl) {

        ShipmentRepositoryImpl.prototype.create = create;
        ShipmentRepositoryImpl.prototype.createDraft = createDraft;
        ShipmentRepositoryImpl.prototype.updateDraft = updateDraft;
        ShipmentRepositoryImpl.prototype.getByOrderId = getByOrderId;
        ShipmentRepositoryImpl.prototype.getDraftByOrderId = getDraftByOrderId;
        ShipmentRepositoryImpl.prototype.deleteDraft = deleteDraft;

        return ShipmentRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name ShipmentRepositoryImpl
         * @constructor
         * 
         * @description
         * Creates an object of the ShipmentRepositoryImpl class and initiates all required
         * dependencies.
         */
        function ShipmentRepositoryImpl() {
            this.shipmentResource = new ShipmentResource();
            this.shipmentDraftResource = new ShipmentDraftResource();
            this.stockCardSummaryRepositoryImpl = new StockCardSummaryRepositoryImpl();
            this.orderResource = new OrderResource();
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name create
         * 
         * @description
         * Creates a new shipment on the OpenLMIS server.
         * 
         * @param  {Object}  json the JSON representation of the shipment
         * @return {Promise}      the promise resolving to combined JSON which can be used for
         *                        creating instance of the Shipment class
         */
        function create(json) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            return this.shipmentResource.create(json)
                .then(function(shipmentJson) {
                    return extendResponse(shipmentJson, orderResource, stockCardSummaryRepositoryImpl);
                });
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name createDraft
         *
         * @description
         * Creates a new shipment draft on the OpenLMIS server.
         * 
         * @param  {Object}  json the JSON representation of the shipment draft
         * @return {Promise}      the promise resolving to combined JSON which can be used for
         *                        creating instance of the Shipment class
         */
        function createDraft(json) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            return this.shipmentDraftResource.create(json)
                .then(function(shipmentJson) {
                    return extendResponse(shipmentJson, orderResource, stockCardSummaryRepositoryImpl);
                });
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name updateDraft
         * 
         * @description
         * Updates the given shipment draft on the OpenLMIS server.
         * 
         * @param  {Object}  draft the shipment draft
         * @return {Promise}       returns a promise resolving when the update was successful,
         *                         rejects if anything goes wrong
         */
        function updateDraft(draft) {
            return this.shipmentDraftResource.update(draft);
        }

        function deleteDraft(draft) {
            return this.shipmentDraftResource.delete(draft);
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name getByOrderId
         * 
         * @description
         * Retrieves a shipment for order with given ID from the OpenLMIS server.
         * 
         * @param  {Object}  orderId the order ID
         * @return {Promise}         the promise resolving to combined JSON which can be used for
         *                           creating instance of the Shipment class
         */
        function getByOrderId(orderId) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            return this.shipmentResource.query({
                orderId: orderId
            })
                .then(function(page) {
                    return extendResponse(page.content[0], orderResource, stockCardSummaryRepositoryImpl);
                });
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name getDraftByOrderId
         * 
         * @description
         * Retrieves a shipment draft for order with given ID from the OpenLMIS server.
         * 
         * @param  {Object}  orderId the order ID
         * @return {Promise}         the promise resolving to combined JSON which can be used for
         *                           creating instance of the Shipment class
         */
        function getDraftByOrderId(orderId) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            return this.shipmentDraftResource.query({
                orderId: orderId
            })
                .then(function(page) {
                    return extendResponse(page.content[0], orderResource, stockCardSummaryRepositoryImpl);
                });
        }

        function extendResponse(shipmentJson, orderResource, stockCardSummaryRepositoryImpl) {
            var summaries;
            return orderResource.get(shipmentJson.order.id)
                .then(function(orderJson) {
                    var orderableIds = orderJson.orderLineItems.map(function(lineItem) {
                        return lineItem.orderable.id;
                    });

                    return stockCardSummaryRepositoryImpl.query({
                        programId: orderJson.program.id,
                        facilityId: orderJson.supplyingFacility.id,
                        orderableId: orderableIds
                    })
                        .then(function(page) {
                            summaries = page.content;
                            return summaries;
                        })
                        .then(mapCanFulfillForMe)
                        .then(function(canFulfillForMeMap) {
                            return combineResponses(shipmentJson, orderJson, canFulfillForMeMap);
                        });
                });
        }

        function combineResponses(shipment, order, canFulfillForMeMap) {
            shipment.order = order;
            // SELV3-666:
            shipment.lineItems = filterNotNullOrderable(shipment.lineItems);
            // SELV3-666: Ends here

            shipment.lineItems.forEach(function(lineItem) {
                lineItem.canFulfillForMe = canFulfillForMeMap[lineItem.orderable.id][getId(lineItem.lot)];
            });

            return shipment;
        }

        function mapCanFulfillForMe(summaries) {
            var canFulfillForMeMap = {};

            summaries.forEach(function(summary) {
                summary.canFulfillForMe.forEach(function(canFulfillForMe) {
                    var orderableId = canFulfillForMe.orderable.id,
                        lotId = canFulfillForMe.lot ? canFulfillForMe.lot.id : undefined;

                    if (!canFulfillForMeMap[orderableId]) {
                        canFulfillForMeMap[orderableId] = {};
                    }

                    canFulfillForMeMap[orderableId][lotId] = canFulfillForMe;
                });
            });

            return canFulfillForMeMap;
        }

        function getId(object) {
            return object ? object.id : undefined;
        }

        // SELV3-666:
        function filterNotNullOrderable(lineItems) {
            return lineItems.filter(function(lineItem) {
                return lineItem.orderable !== null;
            });
        }
        // SELV3-666: Ends here
    }
})();