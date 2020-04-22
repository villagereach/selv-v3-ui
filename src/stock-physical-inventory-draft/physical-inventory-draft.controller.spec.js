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

describe('PhysicalInventoryDraftController', function() {

    var vm, $q, $rootScope, scope, state, stateParams, addProductsModalService, draftFactory,
        chooseDateModalService, facility, program, draft, lineItem, lineItem1, lineItem2, lineItem3,
        lineItem4, reasons, physicalInventoryService, stockmanagementUrlFactory, accessTokenFactory,
        $window, $controller, confirmService, PhysicalInventoryLineItemDataBuilder, OrderableDataBuilder,
        ReasonDataBuilder, LotDataBuilder, PhysicalInventoryLineItemAdjustmentDataBuilder,
        // SELV3-142: Added lot-management feature
        editLotModalService;
        // SELV3-142: ends here

    beforeEach(function() {

        module('stock-physical-inventory-draft');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            scope = $rootScope.$new();
            $window = $injector.get('$window');
            PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            PhysicalInventoryLineItemAdjustmentDataBuilder = $injector
                .get('PhysicalInventoryLineItemAdjustmentDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
            // SELV3-142: Added lot-management feature
            this.LotResource = $injector.get('LotResource');
            // SELV3-142: ends here

            state = jasmine.createSpyObj('$state', ['go']);
            chooseDateModalService = jasmine.createSpyObj('chooseDateModalService', ['show']);
            state.current = {
                name: '/a/b'
            };
            addProductsModalService = $injector.get('addProductsModalService');
            spyOn(addProductsModalService, 'show');
            // SELV3-142: Added lot-management feature
            editLotModalService = $injector.get('editLotModalService');
            spyOn(editLotModalService, 'show');
            // SELV3-142: ends here
            draftFactory = $injector.get('physicalInventoryFactory');

            physicalInventoryService = jasmine.createSpyObj('physicalInventoryService', [
                'submitPhysicalInventory', 'deleteDraft'
            ]);

            stockmanagementUrlFactory = jasmine.createSpy();
            stockmanagementUrlFactory.andCallFake(function(url) {
                return 'http://some.url' + url;
            });

            accessTokenFactory = jasmine.createSpyObj('accessTokenFactory', ['addAccessToken']);
            confirmService = jasmine.createSpyObj('confirmService', ['confirm', 'confirmDestroy']);

            program = {
                name: 'HIV',
                id: '1'
            };

            facility = {
                id: '10134',
                name: 'National Warehouse'
            };

            stateParams = {
                id: 321
            };

            lineItem1 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(1)
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

            lineItem2 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(null)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C300')
                    .withFullProductName('b')
                    .build())
                .build();

            lineItem3 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(null)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C200')
                    .withFullProductName('b')
                    .build())
                .withLot(new LotDataBuilder()
                    .build())
                .buildAsAdded();

            lineItem4 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(null)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C300')
                    .withFullProductName('b')
                    .build())
                .withLot(new LotDataBuilder()
                    .build())
                .build();

            lineItem = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(20)
                .withStockOnHand(10)
                .withStockAdjustments([
                    new PhysicalInventoryLineItemAdjustmentDataBuilder()
                        .withQuantity(10)
                        .build()
                ])
                .build();

            draft = {
                id: 321,
                lineItems: [
                    lineItem1, lineItem2, lineItem3, lineItem4
                ]
            };

            reasons = [
                new ReasonDataBuilder().buildCreditReason(),
                new ReasonDataBuilder().buildDebitReason()
            ];

            vm = initController();

            vm.$onInit();
        });
    });

    describe('onInit', function() {
        it('should init displayLineItemsGroup and sort by product code properly', function() {
            expect(vm.displayLineItemsGroup).toEqual([
                [lineItem1],
                [lineItem3]
            ]);
        });

        it('should set showVVMStatusColumn to true if any orderable use vvm', function() {
            draft.lineItems[0].orderable.extraData = {
                useVVM: 'true'
            };
            vm = initController();
            vm.$onInit();

            expect(vm.showVVMStatusColumn).toBe(true);
        });

        it('should set showVVMStatusColumn to false if no orderable use vvm', function() {
            draft.lineItems.forEach(function(card) {
                card.orderable.extraData = {
                    useVVM: 'false'
                };
            });
            vm = initController();
            vm.$onInit();

            expect(vm.showVVMStatusColumn).toBe(false);
        });

        it('should watch paged list to group items', function() {
            vm = initController();
            vm.$onInit();

            vm.pagedLineItems = [[lineItem1]];
            vm.program.id = lineItem1.orderable.programs[0].programId;
            $rootScope.$apply();

            expect(vm.groupedCategories[lineItem1.orderable.programs[0].orderableCategoryDisplayName])
                .toEqual([[lineItem1]]);
        });
    });

    it('should reload with page and keyword when search', function() {
        vm.keyword = '200';
        vm.search();

        var params = {
            page: 0,
            keyword: '200',
            id: draft.id,
            draft: draft,
            program: program,
            facility: facility
        };

        expect(state.go).toHaveBeenCalledWith('/a/b', params, {
            reload: '/a/b'
        });
    });

    // SELV3-142: Added lot-management feature
    it('should pass all available orderables to add products modal', function() {
        var deferred = $q.defer();
        deferred.resolve();
        addProductsModalService.show.andReturn(deferred.promise);

        vm.addProducts();

        expect(addProductsModalService.show).toHaveBeenCalledWith([
            lineItem2,
            lineItem4,
            getLineItemByOrderable(lineItem1.orderable),
            getLineItemByOrderable(lineItem3.orderable)
        ], [lineItem1, lineItem2, lineItem3, lineItem4]);
    });

    function getLineItemByOrderable(orderable) {
        return {
            lot: null,
            orderable: orderable,
            quantity: null,
            stockAdjustments: [],
            stockOnHand: null,
            vvmStatus: null,
            $allLotsAdded: true
        };
    }

    describe('saveDraft', function() {
        it('should open confirmation modal', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            spyOn(draftFactory, 'saveDraft');

            draftFactory.saveDraft.andReturn($q.resolve());

            vm.saveDraftOrSubmit(false);
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'stockPhysicalInventoryDraft.saveDraft',
                'stockPhysicalInventoryDraft.save'
            );
        });

        it('should not save lots if all exists', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            spyOn(draftFactory, 'saveDraft');
            spyOn(this.LotResource.prototype, 'create');

            draftFactory.saveDraft.andReturn($q.resolve());

            vm.saveDraftOrSubmit(false);
            $rootScope.$apply();

            expect(this.LotResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should save lots if any missing lots were added', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            spyOn(draftFactory, 'saveDraft');

            lineItem3.lot.id = undefined;
            lineItem3.$isNewItem = true;
            lineItem4.lot.id = undefined;
            lineItem4.$isNewItem = true;

            spyOn(this.LotResource.prototype, 'create').andCallFake(function(lot) {
                return $q.resolve(lot);
            });
            spyOn(this.LotResource.prototype, 'query').andCallFake(function(response) {
                response.numberOfElements = 0;
                return $q.resolve(response);
            });
            draftFactory.saveDraft.andReturn($q.resolve());

            vm.saveDraftOrSubmit(false);
            $rootScope.$apply();

            expect(this.LotResource.prototype.create.calls.length).toBe(2);
            expect(draftFactory.saveDraft).toHaveBeenCalledWith(draft);
        });

        it('should not save lots if new lot already exist', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            spyOn(draftFactory, 'saveDraft');

            lineItem3.lot.id = undefined;
            lineItem3.$isNewItem = true;
            lineItem4.lot.id = undefined;
            lineItem4.$isNewItem = true;

            spyOn(this.LotResource.prototype, 'query').andCallFake(function(response) {
                response.numberOfElements = 1;
                return $q.resolve(response);
            });

            draftFactory.saveDraft.andReturn($q.resolve());

            vm.saveDraftOrSubmit(false);
            $rootScope.$apply();

            expect(this.LotResource.prototype.query.calls.length).toBe(2);
            expect(draftFactory.saveDraft).not.toHaveBeenCalled();
        });

        it('should save draft', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            spyOn(draftFactory, 'saveDraft');

            draftFactory.saveDraft.andReturn($q.resolve());

            vm.saveDraftOrSubmit(false);
            $rootScope.$apply();

            expect(draftFactory.saveDraft).toHaveBeenCalledWith(draft);
        });
    });

    it('should highlight empty quantities before submit', function() {
        vm.submit();

        expect(lineItem1.quantityInvalid).toBeFalsy();
        expect(lineItem3.quantityInvalid).toBeTruthy();
    });

    it('should not show modal for occurred date if any quantity missing', function() {
        vm.submit();

        expect(chooseDateModalService.show).not.toHaveBeenCalled();
    });

    it('should show modal for occurred date if no quantity missing', function() {
        lineItem3.quantity = 123;
        lineItem3.stockAdjustments = [{
            quantity: 123,
            reason: {
                reasonType: 'CREDIT'
            }
        }];
        var deferred = $q.defer();
        deferred.resolve();
        confirmService.confirmDestroy.andReturn($q.resolve());
        chooseDateModalService.show.andReturn(deferred.promise);

        vm.saveDraftOrSubmit(true);
        $rootScope.$apply();

        expect(chooseDateModalService.show).toHaveBeenCalled();
    });

    describe('when submit pass validations', function() {
        beforeEach(function() {
            lineItem3.quantity = 123;
            lineItem3.stockAdjustments = [{
                quantity: 123,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            spyOn($window, 'open').andCallThrough();
            confirmService.confirmDestroy.andReturn($q.resolve());
            chooseDateModalService.show.andReturn($q.when({}));
        });

        it('and choose "print" should open report and change state', function() {
            physicalInventoryService.submitPhysicalInventory
                .andReturn($q.when());
            confirmService.confirm.andReturn($q.when());
            accessTokenFactory.addAccessToken.andReturn('url');

            draft.id = 1;
            vm.saveDraftOrSubmit(true);
            $rootScope.$apply();

            expect($window.open).toHaveBeenCalledWith('url', '_blank');
            expect(accessTokenFactory.addAccessToken)
                .toHaveBeenCalledWith('http://some.url/api/physicalInventories/1?format=pdf');

            expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries',
                {
                    program: program.id,
                    facility: facility.id
                });
        });

        it('and choose "no" should change state and not open report', function() {
            physicalInventoryService.submitPhysicalInventory
                .andReturn($q.when());
            confirmService.confirm.andReturn($q.reject());
            accessTokenFactory.addAccessToken.andReturn('url');

            draft.id = 1;
            vm.saveDraftOrSubmit(true);
            $rootScope.$apply();

            expect($window.open).not.toHaveBeenCalled();
            expect(accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries',
                {
                    program: program.id,
                    facility: facility.id
                });
        });

        it('and service call failed should not open report and not change state', function() {
            physicalInventoryService.submitPhysicalInventory.andReturn($q.reject());

            vm.saveDraftOrSubmit(true);
            $rootScope.$apply();

            expect($window.open).not.toHaveBeenCalled();
            expect(accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
            expect(state.go).not.toHaveBeenCalled();
        });

        it('should save lots if any missing lots were added', function() {
            physicalInventoryService.submitPhysicalInventory
                .andReturn($q.when());
            confirmService.confirm.andReturn($q.reject());
            accessTokenFactory.addAccessToken.andReturn('url');

            lineItem3.lot.id = undefined;
            lineItem3.$isNewItem = true;
            lineItem4.lot.id = undefined;
            lineItem4.$isNewItem = true;
            spyOn(this.LotResource.prototype, 'create').andCallFake(function(lot) {
                return $q.resolve(lot);
            });
            spyOn(this.LotResource.prototype, 'query').andCallFake(function(response) {
                response.numberOfElements = 0;
                return $q.resolve(response);
            });

            vm.saveDraftOrSubmit(true);
            $rootScope.$apply();

            expect(this.LotResource.prototype.create.calls.length).toBe(2);
            expect(physicalInventoryService.submitPhysicalInventory).toHaveBeenCalledWith(draft);
        });

        it('should not save lots if all exists', function() {
            physicalInventoryService.submitPhysicalInventory
                .andReturn($q.when());
            confirmService.confirm.andReturn($q.reject());
            accessTokenFactory.addAccessToken.andReturn('url');
            spyOn(this.LotResource.prototype, 'create');

            vm.saveDraftOrSubmit(true);
            $rootScope.$apply();

            expect(this.LotResource.prototype.create).not.toHaveBeenCalled();
            expect(physicalInventoryService.submitPhysicalInventory).toHaveBeenCalledWith(draft);
        });

    });
    // SELV3-142: ends here

    it('should aggregate given field values', function() {
        var lineItem1 = new PhysicalInventoryLineItemDataBuilder()
            .withQuantity(2)
            .withStockOnHand(233)
            .build();

        var lineItem2 = new PhysicalInventoryLineItemDataBuilder()
            .withQuantity(1)
            .withStockOnHand(null)
            .build();

        var lineItems = [lineItem1, lineItem2];

        expect(vm.calculate(lineItems, 'quantity')).toEqual(3);
        expect(vm.calculate(lineItems, 'stockOnHand')).toEqual(233);
    });

    describe('checkUnaccountedStockAdjustments', function() {

        it('should assign unaccounted value to line item', function() {
            expect(lineItem.unaccountedQuantity).toBe(undefined);

            lineItem.quantity = 30;
            vm.checkUnaccountedStockAdjustments(lineItem);

            expect(lineItem.unaccountedQuantity).toBe(10);
        });

        it('should assign 0 as unaccounted value to line item', function() {
            expect(lineItem.unaccountedQuantity).toBe(undefined);

            lineItem.quantity = 20;
            vm.checkUnaccountedStockAdjustments(lineItem);

            expect(lineItem.unaccountedQuantity).toBe(0);
        });

    });

    describe('quantityChanged', function() {

        it('should update progress', function() {
            spyOn(vm, 'updateProgress');

            vm.quantityChanged(lineItem);

            expect(vm.updateProgress).toHaveBeenCalled();
        });

        it('should validate quantity', function() {
            spyOn(vm, 'validateQuantity');

            vm.quantityChanged(lineItem);

            expect(vm.validateQuantity).toHaveBeenCalledWith(lineItem);
        });

        it('should check unaccounted stock adjustments', function() {
            spyOn(vm, 'checkUnaccountedStockAdjustments');

            vm.quantityChanged(lineItem);

            expect(vm.checkUnaccountedStockAdjustments).toHaveBeenCalledWith(lineItem);
        });

    });

    describe('addProduct', function() {

        it('should reload current state after adding product', function() {
            addProductsModalService.show.andReturn($q.resolve());

            vm.addProducts();
            $rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith(state.current.name, stateParams, {
                reload: state.current.name
            });
        });

    });

    describe('delete', function() {

        it('should open confirmation modal', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());

            vm.delete();
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'stockPhysicalInventoryDraft.deleteDraft',
                'stockPhysicalInventoryDraft.delete'
            );
        });

        it('should go to the physical inventory screen after deleting draft', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            physicalInventoryService.deleteDraft.andReturn($q.resolve());

            vm.delete();
            $rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith(
                'openlmis.stockmanagement.physicalInventory',
                stateParams, {
                    reload: true
                }
            );
        });

    });

    // SELV3-142: Added lot-management feature
    describe('remove item from form', function() {
        it('should open confirmation modal', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());

            vm.removeLineItem(lineItem1);
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'stockPhysicalInventoryDraft.deleteItem',
                'stockPhysicalInventoryDraft.yes'
            );
        });

        it('should remove selected lineItem from displayLineItemsGroup', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            vm.removeLineItem(lineItem1);
            $rootScope.$apply();

            expect(lineItem1.quantity).toEqual(null);
            expect(lineItem1.stockOnHand).toEqual(null);
            expect(vm.displayLineItemsGroup).toEqual([
                [lineItem3]
            ]);
        });
    });
    // SELV3-142: ends here

    function initController() {
        return $controller('PhysicalInventoryDraftController', {
            facility: facility,
            program: program,
            $state: state,
            $scope: scope,
            $stateParams: stateParams,
            displayLineItemsGroup: [
                [lineItem1],
                [lineItem3]
            ],
            draft: draft,
            addProductsModalService: addProductsModalService,
            // SELV3-142: Added lot-management feature
            editLotModalService: editLotModalService,
            // SELV3-142: ends here
            chooseDateModalService: chooseDateModalService,
            reasons: reasons,
            physicalInventoryService: physicalInventoryService,
            stockmanagementUrlFactory: stockmanagementUrlFactory,
            accessTokenFactory: accessTokenFactory,
            confirmService: confirmService
        });
    }
});