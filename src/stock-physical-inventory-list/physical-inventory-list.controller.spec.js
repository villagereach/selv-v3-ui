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

describe('PhysicalInventoryListController', function() {

    beforeEach(function() {
        module('stock-physical-inventory-list');

        inject(function($injector, _messageService_) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope =  $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.physicalInventoryService = $injector.get('physicalInventoryService');
            this.physicalInventoryFactory = $injector.get('physicalInventoryFactory');
            this.FunctionDecorator = $injector.get('FunctionDecorator');
            this.messageService = _messageService_;
            this.offlineService = $injector.get('offlineService');
        });

        this.programs = [{
            name: 'HIV',
            id: '1'
        }, {
            name: 'TB',
            id: '2'
        }];
        this.facility = {
            id: '10134',
            name: 'National Warehouse',
            supportedPrograms: this.programs
        };

        var context = this;
        spyOn(this.$state, 'go');
        spyOn(this.FunctionDecorator.prototype, 'decorateFunction').andCallFake(function(fn) {
            context.fn = fn;
            return this;
        });
        spyOn(this.FunctionDecorator.prototype, 'getDecoratedFunction').andCallFake(function() {
            return context.fn;
        });

        this.vm = this.$controller('PhysicalInventoryListController', {
            facility: this.facility,
            programs: this.programs,
            messageService: this.messageService,
            physicalInventoryService: this.physicalInventoryService,
            physicalInventoryFactory: this.physicalInventoryFactory,
            drafts: [{
                programId: '1'
            }, {
                programId: '2'
            }]
        });
    });

    describe('onInit', function() {

        it('should init programs and physical inventory drafts properly', function() {
            expect(this.vm.programs).toEqual(this.programs);
            expect(this.vm.drafts).toEqual([{
                programId: '1'
            }, {
                programId: '2'
            }]);
        });

        it('should get program name by id', function() {
            expect(this.vm.getProgramName('1')).toEqual('HIV');
            expect(this.vm.getProgramName('2')).toEqual('TB');
        });

        // SELV3-247 - Added posibility to view and print history Physical inventory
        // START
        it('should get physical inventory draft status', function() {
            expect(this.vm.getDraftStatus(true, false)).toEqual('stockPhysicalInventory.notStarted');
            expect(this.vm.getDraftStatus(false, true)).toEqual('stockPhysicalInventory.draft');
            expect(this.vm.getDraftStatus(false, false)).toEqual('stockPhysicalInventory.submitted');

        });
        // SELV3-247 - Added posibility to view and print history Physical inventory
        // END

    });

    describe('editDraft', function() {

        it('should go to physical inventory page when proceed', function() {
            var draft = {
                id: 123,
                programId: '1',
                starter: false
            };

            spyOn(this.physicalInventoryFactory, 'getDraft').andReturn(this.$q.when(draft));

            this.vm.editDraft(draft);
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draft', {
                id: draft.id,
                draft: draft,
                program: {
                    name: 'HIV',
                    id: '1'
                },
                facility: this.facility
            });
        });

        it('should create draft to get id and go to physical inventory when proceed', function() {
            var draft = {
                programId: '1',
                starter: false
            };
            var id = '456';

            spyOn(this.physicalInventoryFactory, 'getDraft').andReturn(this.$q.when(draft));
            spyOn(this.physicalInventoryService, 'createDraft').andReturn(this.$q.resolve({
                id: id
            }));

            this.vm.editDraft(draft);
            this.$rootScope.$apply();

            expect(this.physicalInventoryService.createDraft).toHaveBeenCalledWith(draft.programId, this.facility.id);
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draft', {
                id: id,
                draft: draft,
                program: {
                    name: 'HIV',
                    id: '1'
                },
                facility: this.facility
            });
        });
    });
});
