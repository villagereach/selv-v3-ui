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
        fulfillmentUrlFactory, QUANTITY_UNIT, order, messageService, $window, $rootScope, shipmentViewService;

    beforeEach(function() {
        module('shipment-view');

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

});