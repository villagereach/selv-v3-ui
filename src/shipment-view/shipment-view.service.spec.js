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

describe('shipmentViewService', function() {

    // SELV3-507: Allow user to enter Shipment Date
    var shipmentViewService, OrderDataBuilder, shipmentRepositoryMock, shipmentFactoryMock, order,
        ShipmentDataBuilder, shipment, $rootScope, $q, Order, loadingModalService, $state,
        notificationService, stateTrackerService, confirmService, drafts,
        PhysicalInventoryLineItemDataBuilder, PhysicalInventoryLineItemAdjustmentDataBuilder,
        OrderableDataBuilder, FacilityDataBuilder, ProgramDataBuilder, PhysicalInventoryDataBuilder,
        chooseDateModalService;

    beforeEach(function() {
        module('shipment-view', function($provide) {
            shipmentRepositoryMock = jasmine.createSpyObj('shipmentRepository', [
                'getByOrderId', 'getDraftByOrderId', 'createDraft'
            ]);
            $provide.factory('ShipmentRepository', function() {
                return function() {
                    return shipmentRepositoryMock;
                };
            });

            shipmentFactoryMock = jasmine.createSpyObj('shipmentFactory', [
                'buildFromOrder'
            ]);
            $provide.factory('ShipmentFactory', function() {
                return function() {
                    return shipmentFactoryMock;
                };
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            shipmentViewService = $injector.get('shipmentViewService');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            Order = $injector.get('Order');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            stateTrackerService = $injector.get('stateTrackerService');
            $state = $injector.get('$state');
            confirmService = $injector.get('confirmService');
            PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            PhysicalInventoryLineItemAdjustmentDataBuilder = $injector
                .get('PhysicalInventoryLineItemAdjustmentDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            chooseDateModalService = $injector.get('chooseDateModalService');

        });

        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn(notificationService, 'success');
        spyOn(notificationService, 'error');
        spyOn(stateTrackerService, 'goToPreviousState');
        spyOn($state, 'reload');
        spyOn(confirmService, 'confirm');
        spyOn(confirmService, 'confirmDestroy');
        spyOn(chooseDateModalService, 'showWhenChoosingShipmentDate');

        this.program = new ProgramDataBuilder()
            .withId('1')
            .withName('HIV')
            .build();

        this.facility = new FacilityDataBuilder()
            .withId('10134')
            .withName('National Warehouse')
            .buildJson();

        this.lineItem = new PhysicalInventoryLineItemDataBuilder()
            .withQuantity(1)
            .withActive(true)
            .withOrderable(new OrderableDataBuilder()
                .withProductCode('C100')
                .withFullProductName('a')
                .build())
            .withStockAdjustments([
                new PhysicalInventoryLineItemAdjustmentDataBuilder()
                    .withQuantity(1)
                    .build()
            ])
            .build();

        shipment = new ShipmentDataBuilder().build();
        drafts = [new PhysicalInventoryDataBuilder()
            .withProgramId(this.program.id)
            .withFacilityId(this.facility.id)
            .withLineItems([
                this.lineItem1
            ])
            .build()];

        drafts[0].occurredDate = new Date();

        shipmentViewService.setDrafts(drafts);
        // SELV3-507: ends here
    });

    describe('getShipmentForOrder', function() {

        it('should create new shipment for order in the ordered status', function() {
            var json = new ShipmentDataBuilder().buildJson();

            shipmentFactoryMock.buildFromOrder.andReturn($q.resolve(json));
            shipmentRepositoryMock.createDraft.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildOrdered());

            var result;
            shipmentViewService.getShipmentForOrder(order)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            expect(shipmentFactoryMock.buildFromOrder).toHaveBeenCalledWith(order);
            expect(shipmentRepositoryMock.createDraft).toHaveBeenCalledWith(json);
        });

        it('should fetch draft for order in the fulfilling status', function() {
            shipmentRepositoryMock.getDraftByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildFulfilling());

            var result;
            shipmentViewService.getShipmentForOrder(order)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            expect(shipmentRepositoryMock.getDraftByOrderId).toHaveBeenCalledWith(order.id);
        });

        it('should fetch shipment for order in the shipped status', function() {
            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildShipped());

            var result;
            shipmentViewService.getShipmentForOrder(order)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            expect(shipmentRepositoryMock.getByOrderId).toHaveBeenCalledWith(order.id);
        });

        it('should reject if order is undefined', function() {
            var rejected;
            shipmentViewService.getShipmentForOrder()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if factory rejects', function() {
            shipmentFactoryMock.buildFromOrder.andReturn($q.reject());

            order = new Order(new OrderDataBuilder().buildOrdered());

            var rejected;
            shipmentViewService.getShipmentForOrder(order)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            expect(shipmentFactoryMock.buildFromOrder).toHaveBeenCalledWith(order);
        });

        it('should reject if createDraft rejects', function() {
            var json = new ShipmentDataBuilder().buildJson();

            shipmentFactoryMock.buildFromOrder.andReturn($q.resolve(json));
            shipmentRepositoryMock.createDraft.andReturn($q.reject());

            order = new Order(new OrderDataBuilder().buildOrdered());

            var rejected;
            shipmentViewService.getShipmentForOrder(order)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            expect(shipmentFactoryMock.buildFromOrder).toHaveBeenCalledWith(order);
            expect(shipmentRepositoryMock.createDraft).toHaveBeenCalledWith(json);

        });

        it('should reject if getDraftByOrderId rejects', function() {
            shipmentRepositoryMock.getDraftByOrderId.andReturn($q.reject());

            order = new Order(new OrderDataBuilder().buildFulfilling());

            var rejected;
            shipmentViewService.getShipmentForOrder(order)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            expect(shipmentRepositoryMock.getDraftByOrderId).toHaveBeenCalledWith(order.id);
        });

        it('should reject if getByOrderId rejects', function() {
            shipmentRepositoryMock.getByOrderId.andReturn($q.reject());

            order = new Order(new OrderDataBuilder().buildShipped());

            var rejected;
            shipmentViewService.getShipmentForOrder(order)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            expect(shipmentRepositoryMock.getByOrderId).toHaveBeenCalledWith(order.id);
        });

    });

    describe('decorated saved', function() {

        var originalSave;

        beforeEach(function() {
            shipment.save = jasmine.createSpy('save');
            originalSave = shipment.save;

            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildShipped());

            shipmentViewService.getShipmentForOrder(order);
            $rootScope.$apply();
        });

        it('should open loading modal before calling originalSave', function() {
            originalSave.andReturn($q.resolve());

            shipment.save();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalSave).toHaveBeenCalled();

            expect($state.reload).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should reject if original save rejects', function() {
            originalSave.andReturn($q.reject());

            var rejected;
            shipment.save()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should show error on failure', function() {
            originalSave.andReturn($q.reject());

            shipment.save();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalSave).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            expect(notificationService.error)
                .toHaveBeenCalledWith('shipmentView.failedToSaveDraft');

            expect($state.reload).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
        });

        it('should show message, reload on success and return response', function() {
            var result;

            originalSave.andReturn($q.resolve(shipment));

            shipment.save().then(function(response) {
                result = response;
            });
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalSave).toHaveBeenCalled();
            expect($state.reload).toHaveBeenCalled();
            expect(notificationService.success)
                .toHaveBeenCalledWith('shipmentView.draftHasBeenSaved');

            expect(result).toEqual(shipment);

            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

    });

    // SELV3-507: Allow user to enter Shipment Date
    describe('decorated confirm', function() {

        var originalConfirm;

        beforeEach(function() {
            shipment.confirm = jasmine.createSpy('confirm');
            originalConfirm = shipment.confirm;

            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildShipped());

            shipmentViewService.getShipmentForOrder(order);
            chooseDateModalService.showWhenChoosingShipmentDate.andReturn($q.resolve());
            $rootScope.$apply();
        });

        it('should reject if confirmation was dismissed', function() {
            confirmService.confirm.andReturn($q.reject());

            var rejected;
            shipment.confirm()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);

            expect(originalConfirm).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should open loading modal after confirmation', function() {
            confirmService.confirm.andReturn($q.resolve());

            shipment.confirm();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should show error on failure', function() {
            confirmService.confirm.andReturn($q.resolve());
            originalConfirm.andReturn($q.reject());

            shipment.confirm();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
        });

        it('should go to previous state on success', function() {
            confirmService.confirm.andReturn($q.resolve());
            originalConfirm.andReturn($q.resolve());

            shipment.confirm();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

    });
    // SELV3-507: ends here

    describe('decorated delete', function() {

        var originalDelete;

        beforeEach(function() {
            shipment.delete = jasmine.createSpy('delete');
            originalDelete = shipment.delete;

            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildShipped());

            shipmentViewService.getShipmentForOrder(order);
            $rootScope.$apply();
        });

        it('should reject if confirmation was dismissed', function() {
            confirmService.confirmDestroy.andReturn($q.reject());

            var rejected;
            shipment.delete()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);

            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(originalDelete).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should open loading modal after confirmation', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());

            shipment.delete();
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalDelete).toHaveBeenCalledWith();

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should show error on failure', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            originalDelete.andReturn($q.reject());

            shipment.delete();
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalDelete).toHaveBeenCalledWith();
            expect(notificationService.error)
                .toHaveBeenCalledWith('shipmentView.failedToDeleteDraft');

            expect(loadingModalService.close).toHaveBeenCalled();

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
        });

        it('should go to previous state on success', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            originalDelete.andReturn($q.resolve());

            shipment.delete();
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalDelete).toHaveBeenCalledWith();
            expect(notificationService.success).
                toHaveBeenCalledWith('shipmentView.draftHasBeenDeleted');

            expect(stateTrackerService.goToPreviousState).
                toHaveBeenCalledWith('openlmis.orders.view');

            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

    });

});