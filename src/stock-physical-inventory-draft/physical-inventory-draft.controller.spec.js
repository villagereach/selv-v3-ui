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

    var chooseDateModalService;

    beforeEach(function() {

        module('stock-physical-inventory-draft', function() {
            chooseDateModalService = jasmine.createSpyObj('chooseDateModalService', ['show']);
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.scope = this.$rootScope.$new();
            this.$window = $injector.get('$window');
            this.PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            this.PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            this.PhysicalInventoryLineItemAdjustmentDataBuilder = $injector
                .get('PhysicalInventoryLineItemAdjustmentDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.LotDataBuilder = $injector.get('LotDataBuilder');
            this.$state = $injector.get('$state');
            this.stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            this.draftFactory = $injector.get('physicalInventoryFactory');
            this.addProductsModalService = $injector.get('addProductsModalService');
            this.accessTokenFactory = $injector.get('accessTokenFactory');
            this.physicalInventoryService = $injector.get('physicalInventoryService');
            this.confirmService = $injector.get('confirmService');
            this.physicalInventoryDraftCacheService = $injector.get('physicalInventoryDraftCacheService');
            this.alertService = $injector.get('alertService');
            // SELV3-142: Added lot-management feature
            this.LotResource = $injector.get('LotResource');
            this.editLotModalService = $injector.get('editLotModalService');
            // SELV3-142: ends here
        });

        spyOn(this.physicalInventoryService, 'submitPhysicalInventory');
        spyOn(this.physicalInventoryService, 'deleteDraft');
        spyOn(this.confirmService, 'confirm');
        spyOn(this.confirmService, 'confirmDestroy');
        spyOn(this.addProductsModalService, 'show');
        spyOn(this.$state, 'go');
        spyOn(this.draftFactory, 'saveDraft');
        spyOn(this.physicalInventoryDraftCacheService, 'cacheDraft');
        spyOn(this.alertService, 'error');
        // SELV3-142: Added lot-management feature
        spyOn(this.editLotModalService, 'show');
        // SELV3-142: ends here

        this.program = new this.ProgramDataBuilder()
            .withId('1')
            .withName('HIV')
            .build();

        this.facility = new this.FacilityDataBuilder()
            .withId('10134')
            .withName('National Warehouse')
            .buildJson();

        this.lineItem1 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(1)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C100')
                .withFullProductName('a')
                .build())
            .withStockAdjustments([
                new this.PhysicalInventoryLineItemAdjustmentDataBuilder()
                    .withQuantity(1)
                    .build()
            ])
            .build();

        this.lineItem2 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(null)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C300')
                .withFullProductName('b')
                .build())
            .build();

        this.lineItem3 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(null)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C200')
                .withFullProductName('b')
                .build())
            .withLot(new this.LotDataBuilder()
                .build())
            .buildAsAdded();

        this.lineItem4 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(null)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C300')
                .withFullProductName('b')
                .build())
            .withLot(new this.LotDataBuilder()
                .build())
            .build();

        this.lineItem = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(20)
            .withStockOnHand(10)
            .withStockAdjustments([
                new this.PhysicalInventoryLineItemAdjustmentDataBuilder()
                    .withQuantity(10)
                    .build()
            ])
            .build();

        this.draft = new this.PhysicalInventoryDataBuilder()
            .withProgramId(this.program.id)
            .withFacilityId(this.facility.id)
            .withLineItems([
                this.lineItem1,
                this.lineItem2,
                this.lineItem3,
                this.lineItem4
            ])
            .build();

        this.reasons = [
            new this.ReasonDataBuilder().buildCreditReason(),
            new this.ReasonDataBuilder().buildDebitReason()
        ];

        this.stateParams = {
            id: this.draft.id
        };

        this.vm = this.$controller('PhysicalInventoryDraftController', {
            facility: this.facility,
            program: this.program,
            state: this.$state,
            $scope: this.scope,
            $stateParams: this.stateParams,
            displayLineItemsGroup: [
                [this.lineItem1],
                [this.lineItem3]
            ],
            draft: this.draft,
            addProductsModalService: this.addProductsModalService,
            chooseDateModalService: chooseDateModalService,
            reasons: this.reasons,
            physicalInventoryService: this.physicalInventoryService,
            stockmanagementUrlFactory: this.stockmanagementUrlFactory,
            accessTokenFactory: this.accessTokenFactory,
            confirmService: this.confirmService
        });

        this.vm.$onInit();
    });

    describe('onInit', function() {
        it('should init displayLineItemsGroup and sort by product code properly', function() {
            expect(this.vm.displayLineItemsGroup).toEqual([
                [this.lineItem1],
                [this.lineItem3]
            ]);
        });

        it('should set showVVMStatusColumn to true if any orderable use vvm', function() {
            this.draft.lineItems[0].orderable.extraData = {
                useVVM: 'true'
            };

            this.vm.$onInit();

            expect(this.vm.showVVMStatusColumn).toBe(true);
        });

        it('should set showVVMStatusColumn to false if no orderable use vvm', function() {
            this.draft.lineItems.forEach(function(card) {
                card.orderable.extraData = {
                    useVVM: 'false'
                };
            });

            this.vm.$onInit();

            expect(this.vm.showVVMStatusColumn).toBe(false);
        });

        it('should watch paged list to group items', function() {
            this.vm.pagedLineItems = [[this.lineItem1]];
            this.vm.program.id = this.lineItem1.orderable.programs[0].programId;
            this.$rootScope.$apply();

            expect(this.vm.groupedCategories[this.lineItem1.orderable.programs[0].orderableCategoryDisplayName])
                .toEqual([[this.lineItem1]]);
        });

        it('should cache draft', function() {
            this.vm.$onInit();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });
    });

    it('should reload with page and keyword when search', function() {
        this.vm.keyword = '200';
        this.vm.search();

        var params = {
            page: 0,
            keyword: '200',
            id: this.draft.id,
            noReload: true,
            program: this.program,
            facility: this.facility
        };

        expect(this.$state.go).toHaveBeenCalledWith('', params, {
            reload: ''
        });
    });

    // SELV3-142: Added lot-management feature
    it('should pass all available orderables to add products modal', function() {
        var deferred = this.$q.defer();
        deferred.resolve();
        this.addProductsModalService.show.andReturn(deferred.promise);

        this.vm.addProducts();

        expect(this.addProductsModalService.show).toHaveBeenCalledWith([
            this.lineItem2,
            this.lineItem4,
            getLineItemByOrderable(this.lineItem1.orderable),
            getLineItemByOrderable(this.lineItem3.orderable)
        ], [this.lineItem1, this.lineItem2, this.lineItem3, this.lineItem4]);
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

        it('should save draft', function() {
            this.draftFactory.saveDraft.andReturn(this.$q.defer().promise);
            this.$rootScope.$apply();

            this.vm.saveDraftOrSubmit(false);
            this.$rootScope.$apply();

            expect(this.draftFactory.saveDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should cache draft', function() {
            this.draftFactory.saveDraft.andReturn(this.$q.defer().promise);
            this.$rootScope.$apply();

            this.vm.saveDraft();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should not save lots if all exists', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());
            spyOn(this.LotResource.prototype, 'create');

            this.draftFactory.saveDraft.andReturn(this.$q.resolve());

            this.vm.saveDraftOrSubmit(false);
            this.$rootScope.$apply();

            expect(this.LotResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should save lots if any missing lots were added', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());

            this.lineItem3.lot.id = undefined;
            this.lineItem3.$isNewItem = true;
            this.lineItem4.lot.id = undefined;
            this.lineItem4.$isNewItem = true;

            spyOn(this.LotResource.prototype, 'create').andCallFake(function(lot) {
                return this.$q.resolve(lot);
            });
            spyOn(this.LotResource.prototype, 'query').andCallFake(function(response) {
                response.numberOfElements = 0;
                return this.$q.resolve(response);
            });
            this.draftFactory.saveDraft.andReturn(this.$q.resolve());

            this.vm.saveDraftOrSubmit(false);
            this.$rootScope.$apply();

            expect(this.LotResource.prototype.create.calls.length).toBe(2);
            expect(this.draftFactory.saveDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should not save lots if new lot already exist', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());

            this.lineItem3.lot.id = undefined;
            this.lineItem3.$isNewItem = true;
            this.lineItem4.lot.id = undefined;
            this.lineItem4.$isNewItem = true;

            spyOn(this.LotResource.prototype, 'query').andCallFake(function(response) {
                response.numberOfElements = 1;
                return this.$q.resolve(response);
            });

            this.draftFactory.saveDraft.andReturn(this.$q.resolve());

            this.vm.saveDraftOrSubmit(false);
            this.$rootScope.$apply();

            expect(this.LotResource.prototype.query.calls.length).toBe(2);
            expect(this.draftFactory.saveDraft).not.toHaveBeenCalled();
        });

    });

    describe('submit', function() {

        it('should highlight empty quantities before submit', function() {
            this.vm.submit();

            expect(this.lineItem1.quantityInvalid).toBeFalsy();
            expect(this.lineItem3.quantityInvalid).toBeTruthy();
        });

        it('should not show modal for occurred date if any quantity missing', function() {
            this.vm.submit();

            expect(chooseDateModalService.show).not.toHaveBeenCalled();
        });

        it('should show modal for occurred date if no quantity missing', function() {
            this.lineItem3.quantity = 123;
            this.lineItem3.stockAdjustments = [{
                quantity: 123,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            var deferred = this.$q.defer();
            deferred.resolve();
            chooseDateModalService.show.andReturn(deferred.promise);

            this.vm.submit();

            expect(chooseDateModalService.show).toHaveBeenCalled();
        });

    });

    describe('when submit pass validations', function() {
        beforeEach(function() {
            this.lineItem3.quantity = 123;
            this.lineItem3.stockAdjustments = [{
                quantity: 123,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            spyOn(this.$window, 'open').andCallThrough();
            chooseDateModalService.show.andReturn(this.$q.when({}));
            spyOn(this.accessTokenFactory, 'addAccessToken').andCallThrough();
        });

        it('and choose "print" should open report and change state', function() {
            this.physicalInventoryService.submitPhysicalInventory
                .andReturn(this.$q.when());
            this.confirmService.confirm.andReturn(this.$q.when());

            this.draft.id = 1;
            this.vm.saveDraftOrSubmit(true);
            this.$rootScope.$apply();

            expect(this.$window.open).toHaveBeenCalledWith('/api/reports/templates/common/' +
            '968b4abc-ea64-4285-9f46-64544d8af37e/pdf?physInventoryId=1', '_blank');

            expect(this.accessTokenFactory.addAccessToken).toHaveBeenCalled();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries',
                {
                    program: this.program.id,
                    facility: this.facility.id
                });
        });

        it('and choose "no" should change this.$state and not open report', function() {
            this.physicalInventoryService.submitPhysicalInventory
                .andReturn(this.$q.when());
            this.confirmService.confirm.andReturn(this.$q.reject());

            this.draft.id = 1;
            this.vm.saveDraftOrSubmit(true);
            this.$rootScope.$apply();

            expect(this.$window.open).not.toHaveBeenCalled();
            expect(this.accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries',
                {
                    program: this.program.id,
                    facility: this.facility.id
                });
        });

        it('and service call failed should not open report and not change state', function() {
            this.physicalInventoryService.submitPhysicalInventory.andReturn(this.$q.reject());

            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.$window.open).not.toHaveBeenCalled();
            expect(this.accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should return proper error message and remove from local storage', function() {
            spyOn(this.physicalInventoryDraftCacheService, 'removeById');

            this.physicalInventoryService.submitPhysicalInventory.andReturn(this.$q.reject({
                data: {
                    message: 'error occurred'
                }
            }));

            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.alertService.error).toHaveBeenCalledWith('error occurred');
            expect(this.physicalInventoryDraftCacheService.removeById).toHaveBeenCalledWith(this.draft.id);
        });

        it('should save lots if any missing lots were added', function() {
            this.physicalInventoryService.submitPhysicalInventory
                .andReturn(this.$q.when());
            this.confirmService.confirm.andReturn(this.$q.reject());
            this.accessTokenFactory.addAccessToken.andReturn('url');

            this.lineItem3.lot.id = undefined;
            this.lineItem3.$isNewItem = true;
            this.lineItem4.lot.id = undefined;
            this.lineItem4.$isNewItem = true;
            spyOn(this.LotResource.prototype, 'create').andCallFake(function(lot) {
                return this.$q.resolve(lot);
            });
            spyOn(this.LotResource.prototype, 'query').andCallFake(function(response) {
                response.numberOfElements = 0;
                return this.$q.resolve(response);
            });

            this.vm.saveDraftOrSubmit(true);
            this.$rootScope.$apply();

            expect(this.LotResource.prototype.create.calls.length).toBe(2);
            expect(this.physicalInventoryService.submitPhysicalInventory).toHaveBeenCalledWith(this.draft);
        });

        it('should not save lots if all exists', function() {
            this.physicalInventoryService.submitPhysicalInventory
                .andReturn(this.$q.when());
            this.confirmService.confirm.andReturn(this.$q.reject());
            this.accessTokenFactory.addAccessToken.andReturn('url');
            spyOn(this.LotResource.prototype, 'create');

            this.vm.saveDraftOrSubmit(true);
            this.$rootScope.$apply();

            expect(this.LotResource.prototype.create).not.toHaveBeenCalled();
            expect(this.physicalInventoryService.submitPhysicalInventory).toHaveBeenCalledWith(this.draft);
        });

    });
    // SELV3-142: ends here

    it('should aggregate given field values', function() {
        var lineItem1 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(2)
            .withStockOnHand(233)
            .build();

        var lineItem2 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(1)
            .withStockOnHand(null)
            .build();

        var lineItems = [lineItem1, lineItem2];

        expect(this.vm.calculate(lineItems, 'quantity')).toEqual(3);
        expect(this.vm.calculate(lineItems, 'stockOnHand')).toEqual(233);
    });

    describe('checkUnaccountedStockAdjustments', function() {

        it('should assign unaccounted value to line item', function() {
            expect(this.lineItem.unaccountedQuantity).toBe(undefined);

            this.lineItem.quantity = 30;
            this.vm.checkUnaccountedStockAdjustments(this.lineItem);

            expect(this.lineItem.unaccountedQuantity).toBe(10);
        });

        it('should assign 0 as unaccounted value to line item', function() {
            expect(this.lineItem.unaccountedQuantity).toBe(undefined);

            this.lineItem.quantity = 20;
            this.vm.checkUnaccountedStockAdjustments(this.lineItem);

            expect(this.lineItem.unaccountedQuantity).toBe(0);
        });

    });

    describe('quantityChanged', function() {

        it('should update progress', function() {
            spyOn(this.vm, 'updateProgress');

            this.vm.quantityChanged(this.lineItem);

            expect(this.vm.updateProgress).toHaveBeenCalled();
        });

        it('should validate quantity', function() {
            spyOn(this.vm, 'validateQuantity');

            this.vm.quantityChanged(this.lineItem);

            expect(this.vm.validateQuantity).toHaveBeenCalledWith(this.lineItem);
        });

        it('should check unaccounted stock adjustments', function() {
            spyOn(this.vm, 'checkUnaccountedStockAdjustments');

            this.vm.quantityChanged(this.lineItem);

            expect(this.vm.checkUnaccountedStockAdjustments).toHaveBeenCalledWith(this.lineItem);
        });

    });

    describe('addProduct', function() {

        it('should reload current state after adding product', function() {
            this.addProductsModalService.show.andReturn(this.$q.resolve());

            this.vm.addProducts();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, this.stateParams, {
                reload: this.$state.current.name
            });
        });

    });

    describe('delete', function() {

        it('should open confirmation modal', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());

            this.vm.delete();
            this.$rootScope.$apply();

            expect(this.confirmService.confirmDestroy).toHaveBeenCalledWith(
                'stockPhysicalInventoryDraft.deleteDraft',
                'stockPhysicalInventoryDraft.delete'
            );
        });

        it('should go to the physical inventory screen after deleting draft', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());
            this.physicalInventoryService.deleteDraft.andReturn(this.$q.resolve());

            this.vm.delete();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(
                'openlmis.stockmanagement.physicalInventory',
                this.stateParams, {
                    reload: true
                }
            );
        });
    });

    // SELV3-142: Added lot-management feature
    describe('remove item from form', function() {

        it('should open confirmation modal', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());

            this.vm.removeLineItem(this.lineItem1);
            this.$rootScope.$apply();

            expect(this.confirmService.confirmDestroy).toHaveBeenCalledWith(
                'stockPhysicalInventoryDraft.deleteItem',
                'stockPhysicalInventoryDraft.yes'
            );
        });

        it('should remove selected lineItem from displayLineItemsGroup', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());
            this.vm.removeLineItem(this.lineItem1);
            this.$rootScope.$apply();

            expect(this.lineItem1.quantity).toEqual(null);
            expect(this.lineItem1.stockOnHand).toEqual(null);
            expect(this.vm.displayLineItemsGroup).toEqual([
                [this.lineItem3]
            ]);
        });
    });
    // SELV3-142: ends here

});