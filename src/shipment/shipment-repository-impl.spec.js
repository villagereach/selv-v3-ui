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

describe('ShipmentRepositoryImpl', function() {

    var ShipmentRepositoryImpl, shipmentRepositoryImpl, ShipmentDataBuilder, OrderResponseDataBuilder,
        shipment, shipmentResourceMock, orderResourceMock, $q, $rootScope, order,
        stockCardSummaryRepositoryImplMock, StockCardSummaryDataBuilder, ShipmentLineItemDataBuilder,
        CanFulfillForMeEntryDataBuilder, stockCardSummaries, shipmentDraftResourceMock,
        shipmentWithAdditionalInfoResourceMock;

    beforeEach(function() {
        module('shipment', function($provide) {
            shipmentResourceMock = jasmine.createSpyObj('shipmentResource', [
                'create', 'get', 'query'
            ]);
            $provide.factory('ShipmentResource', function() {
                return function() {
                    return shipmentResourceMock;
                };
            });

            // SELV3-846: the confirmed shipment is created via the additional-info extension endpoint
            shipmentWithAdditionalInfoResourceMock = jasmine.createSpyObj(
                'shipmentWithAdditionalInfoResource', ['create']
            );
            $provide.factory('ShipmentWithAdditionalInfoResource', function() {
                return function() {
                    return shipmentWithAdditionalInfoResourceMock;
                };
            });

            shipmentDraftResourceMock = jasmine.createSpyObj('shipmentDraftResource', [
                'create', 'update', 'query'
            ]);
            $provide.factory('ShipmentDraftResource', function() {
                return function() {
                    return shipmentDraftResourceMock;
                };
            });

            orderResourceMock = jasmine.createSpyObj('orderResource', [
                'get'
            ]);
            $provide.factory('OrderResource', function() {
                return function() {
                    return orderResourceMock;
                };
            });

            stockCardSummaryRepositoryImplMock = jasmine.createSpyObj(
                'stockCardSummaryRepositoryImpl', [
                    'query'
                ]
            );
            $provide.factory('StockCardSummaryRepositoryImpl', function() {
                return function() {
                    return stockCardSummaryRepositoryImplMock;
                };
            });
        });

        inject(function($injector) {
            ShipmentRepositoryImpl = $injector.get('ShipmentRepositoryImpl');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            OrderResponseDataBuilder = $injector.get('OrderResponseDataBuilder');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            ShipmentLineItemDataBuilder = $injector.get('ShipmentLineItemDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
        });

        shipmentRepositoryImpl = new ShipmentRepositoryImpl();

        shipment = new ShipmentDataBuilder()
            .withLineItems([
                new ShipmentLineItemDataBuilder().buildJson(),
                new ShipmentLineItemDataBuilder()
                    .withoutLot()
                    .buildJson()
            ])
            .build();

        stockCardSummaries = [
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMeEntry(
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(shipment.lineItems[0].orderable)
                        .withLot(shipment.lineItems[0].lot)
                        .buildJson()
                )
                .buildJson(),
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMeEntry(
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(shipment.lineItems[1].orderable)
                        .withLot(shipment.lineItems[1].lot)
                        .buildJson()
                )
                .buildJson()
        ];

        order = new OrderResponseDataBuilder().build();
    });

    describe('create', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentWithAdditionalInfoResourceMock.create.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.create(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentWithAdditionalInfoResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).not.toHaveBeenCalled();
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch order', function() {
            shipmentWithAdditionalInfoResourceMock.create.andReturn($q.resolve(shipment));
            orderResourceMock.get.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.create(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentWithAdditionalInfoResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch stock card summaries', function() {
            shipmentWithAdditionalInfoResourceMock.create.andReturn($q.resolve(shipment));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.create(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentWithAdditionalInfoResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });
        });

        it('should return combined responses', function() {
            shipmentWithAdditionalInfoResourceMock.create.andReturn($q.resolve(angular.copy(shipment)));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));

            var result;
            shipmentRepositoryImpl.create(shipment)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(shipmentWithAdditionalInfoResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });

        });

    });

    describe('createDraft', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentDraftResourceMock.create.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.createDraft(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).not.toHaveBeenCalled();
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch order', function() {
            shipmentDraftResourceMock.create.andReturn($q.resolve(shipment));
            orderResourceMock.get.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.createDraft(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch stock card summaries', function() {
            shipmentDraftResourceMock.create.andReturn($q.resolve(shipment));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.createDraft(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });
        });

        it('should return combined responses', function() {
            shipmentDraftResourceMock.create.andReturn($q.resolve(angular.copy(shipment)));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));

            var result;
            shipmentRepositoryImpl.createDraft(shipment)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });

        });

    });

    describe('updateDraft', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentDraftResourceMock.update.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.updateDraft(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.update).toHaveBeenCalledWith(shipment);
        });

        it('should resolve if update was successful', function() {
            shipmentDraftResourceMock.update.andReturn($q.resolve(shipment));

            var result;
            shipmentRepositoryImpl.updateDraft(shipment)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            expect(shipmentDraftResourceMock.update).toHaveBeenCalledWith(shipment);
        });

    });

    describe('getByOrderId', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentResourceMock.query.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).not.toHaveBeenCalled();
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch order', function() {
            shipmentResourceMock.query.andReturn($q.resolve({
                content: [shipment]
            }));
            orderResourceMock.get.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch stock card summaries', function() {
            shipmentResourceMock.query.andReturn($q.resolve({
                content: [shipment]
            }));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });
        });

        it('should return combined responses', function() {
            shipmentResourceMock.query.andReturn($q.resolve(angular.copy({
                content: [shipment]
            })));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));

            var result;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });

        });

    });

    describe('getDraftByOrderId', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentDraftResourceMock.query.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getDraftByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).not.toHaveBeenCalled();
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch order', function() {
            shipmentDraftResourceMock.query.andReturn($q.resolve({
                content: [shipment]
            }));
            orderResourceMock.get.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getDraftByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch stock card summaries', function() {
            shipmentDraftResourceMock.query.andReturn($q.resolve({
                content: [shipment]
            }));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getDraftByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });
        });

        it('should return combined responses', function() {
            shipmentDraftResourceMock.query.andReturn($q.resolve(angular.copy({
                content: [shipment]
            })));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));

            var result;
            shipmentRepositoryImpl.getDraftByOrderId(shipment.order.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: order.program.id,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ]
            });

        });

    });

});
