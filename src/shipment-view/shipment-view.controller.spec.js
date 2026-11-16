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

describe('ShipmentViewController', function() {

    // SELV3-507: Allow user to enter Shipment Date
    var vm, $q, $controller, ShipmentDataBuilder, shipment, drafts, tableLineItems, OrderDataBuilder,
        fulfillmentUrlFactory, QUANTITY_UNIT, order, messageService, $window, $rootScope, shipmentViewService,
        alertService;

    beforeEach(function() {
        module('shipment-view', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            QUANTITY_UNIT = $injector.get('QUANTITY_UNIT');
            messageService = $injector.get('messageService');
            $window = $injector.get('$window');
            $rootScope = $injector.get('$rootScope');
            fulfillmentUrlFactory = $injector.get('fulfillmentUrlFactory');
            shipmentViewService = $injector.get('shipmentViewService');
            alertService = $injector.get('alertService');
        });

        shipment = new ShipmentDataBuilder().build();
        order = new OrderDataBuilder().build();
        tableLineItems = [{}, {}];
        drafts = [{}, {}, {}];

        vm = $controller('ShipmentViewController', {
            shipment: shipment,
            tableLineItems: tableLineItems,
            updatedOrder: order,
            shipmentViewService: shipmentViewService,
            drafts: drafts
        });
        // SELV3-507: ends here
    });

    describe('$onInit', function() {

        it('should expose order', function() {
            vm.$onInit();

            expect(vm.order).toEqual(order);
        });

        it('should expose shipment', function() {
            vm.$onInit();

            expect(vm.shipment).toEqual(shipment);
        });

        it('should expose tableLineItems', function() {
            vm.$onInit();

            expect(vm.tableLineItems).toEqual(tableLineItems);
        });
    });

    describe('showInDoses', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return true if showing in doses', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            expect(vm.showInDoses()).toEqual(true);
        });

        it('should return false if showing in packs', function() {
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            expect(vm.showInDoses()).toEqual(false);
        });

    });

    describe('getSelectedQuantityUnitKeyUnitKey', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return \'shipmentView.packs\' for packs', function() {
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            expect(vm.getSelectedQuantityUnitKey()).toEqual('shipmentView.packs');
        });

        it('should return \'shipmentView.doses\' for doses', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            expect(vm.getSelectedQuantityUnitKey()).toEqual('shipmentView.doses');
        });

        it('should return undefined for undefined', function() {
            vm.quantityUnit = undefined;

            expect(vm.getSelectedQuantityUnitKey()).toEqual(undefined);
        });

    });

    describe('getMessageInQuantityUnitKey', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return \'shipmentView.fillQuantityInPack\' for packs', function() {
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            expect(vm.getMessageInQuantityUnitKey()).toEqual('shipmentView.fillQuantityInPack');
        });

        it('should return \'shipmentView.fillQuantityInDoses\' for doses', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            expect(vm.getMessageInQuantityUnitKey()).toEqual('shipmentView.fillQuantityInDoses');
        });

        it('should return undefined for undefined', function() {
            vm.quantityUnit = undefined;

            expect(vm.getMessageInQuantityUnitKey()).toEqual(undefined);
        });

    });

    describe('printShipment', function() {

        var popup, document;

        beforeEach(function() {
            spyOn(shipment, 'save').andReturn($q.resolve(shipment));

            document = jasmine.createSpyObj('document', ['write']);

            popup = {
                document: document,
                location: {}
            };

            spyOn(messageService, 'get').andReturn('Saving and printing');
            spyOn($window, 'open').andReturn(popup);
        });

        it('should show information when saving shipment', function() {
            vm.printShipment();

            expect($window.open).toHaveBeenCalledWith('', '_blank');
            expect(document.write).toHaveBeenCalledWith('Saving and printing');
            expect(messageService.get).toHaveBeenCalledWith('shipmentView.saveDraftPending');
        });

        it('should print shipment after it was saved', function() {
            vm.printShipment();

            expect(popup.location.href).toBeUndefined();

            $rootScope.$apply();

            expect(popup.location.href)
                .toEqual(fulfillmentUrlFactory('/api/reports/templates/common/583ccc35-88b7-48a8-9193-6c4857d3ff60/' +
                    'pdf?shipmentDraftId=' + shipment.id));
        });

    });

    describe('cancelOrder', function() {

        var orderService, confirmService, notificationService, loadingModalService,
            stateTrackerService, authorizationService, FULFILLMENT_RIGHTS;

        beforeEach(function() {
            orderService = jasmine.createSpyObj('orderService', ['cancel']);
            confirmService = jasmine.createSpyObj('confirmService', ['confirm']);
            notificationService = jasmine.createSpyObj('notificationService', ['success', 'error']);
            loadingModalService = jasmine.createSpyObj('loadingModalService', ['open', 'close']);
            stateTrackerService = jasmine.createSpyObj('stateTrackerService', ['goToPreviousState']);
            authorizationService = jasmine.createSpyObj('authorizationService', ['hasRight']);
            FULFILLMENT_RIGHTS = {
                ORDERS_EDIT: 'ORDERS_EDIT'
            };

            confirmService.confirm.andReturn($q.resolve());
            orderService.cancel.andReturn($q.resolve());

            vm = $controller('ShipmentViewController', {
                shipment: shipment,
                tableLineItems: tableLineItems,
                updatedOrder: order,
                orderService: orderService,
                confirmService: confirmService,
                notificationService: notificationService,
                loadingModalService: loadingModalService,
                stateTrackerService: stateTrackerService,
                authorizationService: authorizationService,
                FULFILLMENT_RIGHTS: FULFILLMENT_RIGHTS,
                drafts: drafts
            });
            vm.$onInit();
        });

        it('should confirm and cancel the order', function() {
            vm.cancelOrder();
            $rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'shipmentView.cancelOrder.confirm', 'shipmentView.cancelOrder'
            );

            expect(orderService.cancel).toHaveBeenCalledWith(order.id);
            expect(notificationService.success).toHaveBeenCalledWith('shipmentView.orderCancelled');
            expect(stateTrackerService.goToPreviousState).toHaveBeenCalledWith('openlmis.orders.view');
            expect(loadingModalService.open).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should notify error when cancel fails', function() {
            orderService.cancel.andReturn($q.reject());

            vm.cancelOrder();
            $rootScope.$apply();

            expect(notificationService.error).toHaveBeenCalledWith('shipmentView.orderCancelFailed');
            expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should check ORDERS_EDIT right for cancel', function() {
            spyOn(shipment, 'isEditable').andReturn(true);
            authorizationService.hasRight.andReturn(true);

            expect(vm.canCancelOrder()).toBe(true);
            expect(authorizationService.hasRight).toHaveBeenCalledWith('ORDERS_EDIT', {
                facilityId: order.supplyingFacility.id
            });
        });

    });

    // SELVSUP-72: Block confirming a shipment with no quantities
    describe('confirmShipment', function() {

        beforeEach(function() {
            spyOn(shipment, 'confirm').andReturn($q.resolve());
            spyOn(alertService, 'error');
        });

        it('should not confirm shipment when all quantities are 0', function() {
            shipment.lineItems.forEach(function(lineItem) {
                lineItem.quantityShipped = 0;
            });

            vm.confirmShipment();

            expect(alertService.error).toHaveBeenCalledWith('shipmentView.emptyShipmentNotAllowed');
            expect(shipment.confirm).not.toHaveBeenCalled();
        });

        it('should confirm shipment when any quantity is greater than 0', function() {
            shipment.lineItems.forEach(function(lineItem) {
                lineItem.quantityShipped = 0;
            });
            shipment.lineItems[0].quantityShipped = 1;

            vm.confirmShipment();

            expect(shipment.confirm).toHaveBeenCalled();
            expect(alertService.error).not.toHaveBeenCalled();
        });
    });
    // SELVSUP-72: ends here

});
