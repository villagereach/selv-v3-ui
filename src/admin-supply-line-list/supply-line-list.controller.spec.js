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

describe('SupplyLineListController', function() {

    beforeEach(function() {
        module('admin-supply-line-list');

        inject(function($injector) {
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.SupplyLineDataBuilder = $injector.get('SupplyLineDataBuilder');
            this.SupplyLineResource = $injector.get('SupplyLineResource');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.loadingModalService = $injector.get('loadingModalService');
            this.confirmService = $injector.get('confirmService');
            this.notificationService = $injector.get('notificationService');
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
        });

        this.confirmDeferred = this.$q.defer();

        this.supplyingFacilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];
        this.supplyLines = [
            new this.SupplyLineDataBuilder().buildJson(),
            new this.SupplyLineDataBuilder().buildJson()
        ];
        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.stateParams = {
            page: 0,
            size: 10,
            supplyingFacilityId: this.supplyingFacilities[0].id,
            programId: this.programs[0].id
        };

        this.supplyLineExpandEnabled = false;

        this.vm = this.$controller('SupplyLineListController', {
            supplyLines: this.supplyLines,
            supplyingFacilities: this.supplyingFacilities,
            programs: this.programs,
            $stateParams: this.stateParams
        });
        this.vm.$onInit();

        spyOn(this.$state, 'go').andReturn();
        //SELV3-304:
        spyOn(this.confirmService, 'confirmDestroy').andReturn(this.confirmDeferred.promise);
        spyOn(this.loadingModalService, 'open').andReturn(this.$q.resolve());
        spyOn(this.SupplyLineResource.prototype, 'delete').andReturn(this.$q.resolve());
        spyOn(this.notificationService, 'success').andReturn();
    });

    describe('onInit', function() {

        it('should expose search method', function() {
            expect(angular.isFunction(this.vm.search)).toBe(true);
        });

        it('should expose filtered supply lines array', function() {
            expect(this.vm.supplyLines).toEqual(this.supplyLines);
        });

        it('should expose supplying facilities array', function() {
            expect(this.vm.supplyingFacilities).toEqual(this.supplyingFacilities);
        });

        it('should expose supplying facility id', function() {
            expect(this.vm.supplyingFacilityId).toEqual(this.stateParams.supplyingFacilityId);
        });

        it('should expose programs array', function() {
            expect(this.vm.programs).toEqual(this.programs);
        });

        it('should expose program id', function() {
            expect(this.vm.programId).toEqual(this.stateParams.programId);
        });
    });

    describe('search', function() {

        it('should search by supplying facility', function() {
            this.vm.supplyingFacilityId = 'facility-id';
            this.vm.programId = undefined;

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.supplyLines', {
                page: this.stateParams.page,
                size: this.stateParams.size,
                supplyingFacilityId: this.vm.supplyingFacilityId
            }, {
                reload: true
            });
        });

        it('should search by program', function() {
            this.vm.programId = 'program-id';
            this.vm.supplyingFacilityId = undefined;

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.supplyLines', {
                page: this.stateParams.page,
                size: this.stateParams.size,
                programId: this.vm.programId
            }, {
                reload: true
            });
        });

        it('should call state go method', function() {
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalled();
        });
    });

    describe('showFacilityPopover', function() {

        it('should not show facility popover when requisition group is empty', function() {
            this.supplyLines[0].supervisoryNode.requisitionGroup = [];

            expect(this.vm.showFacilityPopover(this.supplyLines[0])).toBeFalsy();
        });

        it('should not show facility popover when requisition group is null', function() {
            this.supplyLines[0].supervisoryNode.requisitionGroup = [];

            expect(this.vm.showFacilityPopover(this.supplyLines[0])).toBeFalsy();
        });

        it('should not show facility popover when member facilities are null', function() {
            this.supplyLines[0].supervisoryNode.requisitionGroup.memberFacilities = null;

            expect(this.vm.showFacilityPopover(this.supplyLines[0])).toBeFalsy();
        });

        it('should not show facility popover when member facilities are empty', function() {
            this.supplyLines[0].supervisoryNode.requisitionGroup.memberFacilities = [];

            expect(this.vm.showFacilityPopover(this.supplyLines[0])).toBeFalsy();
        });

        it('should show facility popover when member facilities are not empty', function() {
            this.supplyLines[0].supervisoryNode.requisitionGroup.memberFacilities = [
                new this.FacilityDataBuilder().build()
            ];

            expect(this.vm.showFacilityPopover(this.supplyLines[0])).toBeTruthy();
        });
    });

    //SELV3-340: Delete supply line test
    describe('deleteSupplyLine', function() {

        it('should call deleteSupplyLine method', function() {
            this.vm.deleteSupplyLine(this.supplyLines);

            this.confirmDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.confirmService.confirmDestroy).toHaveBeenCalledWith(
                'adminSupplyLineList.delete.confirm',
                'adminSupplyLineList.delete'
            );

            expect(this.loadingModalService.open).toHaveBeenCalled();
            expect(this.SupplyLineResource.prototype.delete).toHaveBeenCalledWith(this.supplyLines);
            expect(this.$state.go).toHaveBeenCalled();
            expect(this.notificationService.success)
                .toHaveBeenCalledWith('adminSupplyLineList.supplyLineDeletedSuccessfully');
        });

        it('should not delete the supply line if user clicked cancel button', function() {
            this.vm.deleteSupplyLine(this.supplyLines);

            this.confirmDeferred.reject();
            this.$rootScope.$apply();

            expect(this.SupplyLineResource.prototype.delete).not.toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();
            expect(this.notificationService.success).not.toHaveBeenCalled();
        });
    });
});