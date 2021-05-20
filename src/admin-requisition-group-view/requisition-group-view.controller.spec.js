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

describe('RequisitionGroupViewController', function() {

    beforeEach(function() {
        module('admin-requisition-group-view');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.RequisitionGroupDataBuilder = $injector.get('RequisitionGroupDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.facilityService = $injector.get('facilityService');
            this.notificationService = $injector.get('notificationService');
            this.requisitionGroupService = $injector.get('requisitionGroupService');
            this.loadingModalService = $injector.get('loadingModalService');
            this.confirmService = $injector.get('confirmService');
            this.stateTrackerService = $injector.get('stateTrackerService');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.facilityFactory = $injector.get('facilityFactory');
        });

        this.requisitionGroup = new this.RequisitionGroupDataBuilder().buildJson();
        // SELV3-337: Added the ability to add facility to the requisition group
        this.memberFacilities = [
            new this.FacilityDataBuilder()
                .withId('id_3')
                .build(),
            new this.FacilityDataBuilder()
                .withId('id_4')
                .build()
        ];

        this.facilities = [
            new this.FacilityDataBuilder()
                .withId('id_1')
                .build(),
            new this.FacilityDataBuilder()
                .withId('id_2')
                .build(),
            new this.FacilityDataBuilder()
                .withId('id_3')
                .build()
        ];

        this.allMemeberFacilities = this.memberFacilities;

        this.facility = new this.FacilityDataBuilder()
            .withId('id_1')
            .build();

        this.stateParams = {
            page: 0,
            size: 10,
            id: 'group-id',
            tab: 0,
            facilityName: 'facility'
        };
        spyOn(this.facilityFactory, 'searchAndOrderFacilities').andReturn(this.allMemeberFacilities);

        this.vm = this.$controller('RequisitionGroupViewController', {
            requisitionGroup: this.requisitionGroup,
            memberFacilities: this.memberFacilities,
            facilities: this.facilities,
            $stateParams: this.stateParams,
            selectedFacility: undefined,
            allMemeberFacilities: this.allMemeberFacilities
        });
        this.vm.$onInit();

        this.confirmDeferred = this.$q.defer();
        this.saveDeferred = this.$q.defer();
        this.loadingDeferred = this.$q.defer();

        spyOn(this.$state, 'go').andReturn();
        spyOn(this.facilityService, 'get').andReturn(this.$q.resolve(this.facility));
        spyOn(this.notificationService, 'error');
        spyOn(this.notificationService, 'success');
        spyOn(this.confirmService, 'confirm').andReturn(this.confirmDeferred.promise);
        spyOn(this.stateTrackerService, 'goToPreviousState').andCallFake(this.loadingDeferred.resolve);
        spyOn(this.requisitionGroupService, 'update').andReturn(this.saveDeferred.promise);
        spyOn(this.loadingModalService, 'open').andReturn(this.loadingDeferred.promise);
        spyOn(this.loadingModalService, 'close').andCallFake(this.loadingDeferred.resolve);
        // SELV3-337: ends here
    });

    describe('onInit', function() {

        it('should expose requisition group', function() {
            expect(this.vm.requisitionGroup).toEqual(this.requisitionGroup);
        });

        it('should expose member facilities', function() {
            expect(this.vm.memberFacilities).toEqual(this.memberFacilities);
        });

        it('should expose facility name', function() {
            expect(this.vm.facilityName).toEqual(this.stateParams.facilityName);
        });

        it('should expose selected tab', function() {
            expect(this.vm.selectedTab).toEqual(this.stateParams.tab);
        });

        it('should expose search for facilities method', function() {
            expect(angular.isFunction(this.vm.searchForFacilities)).toBe(true);
        });
    });

    // SELV3-337: Added the ability to add facility to the requisition group
    describe('addFacility', function() {
        it('should add selected facility to memeberFacilities', function() {
            this.vm.selectedFacility = this.facility;
            this.vm.addFacility();
            this.$rootScope.$apply();

            expect(this.vm.allMemeberFacilities.length).toEqual(3);
            expect(this.$state.go).toHaveBeenCalled();
        });

        it('should not add selected facility to memeberFacilities', function() {
            this.vm.selectedFacility = this.facilities[2];
            this.vm.addFacility();
            this.$rootScope.$apply();

            expect(this.vm.allMemeberFacilities.length).toEqual(2);
            expect(this.notificationService.error).toHaveBeenCalledWith(
                'adminRequisitionGroupView.facilityAlreadyAdded'
            );

            expect(this.$state.go).not.toHaveBeenCalled();
        });
    });

    describe('save', function() {
        it('should prompt user to save requisition group', function() {
            this.vm.save();

            expect(this.confirmService.confirm).toHaveBeenCalledWith(
                'adminRequisitionGroupView.save.question', 'adminRequisitionGroupView.save'
            );
        });

        it('should not save requisition group if user does not confirm it', function() {
            this.vm.save();

            this.confirmDeferred.reject();
            this.$rootScope.$apply();

            expect(this.requisitionGroupService.update).not.toHaveBeenCalled();
        });

        it('should save requisition group and open loading modal after confirm', function() {
            this.vm.save();

            this.confirmDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.requisitionGroupService.update).toHaveBeenCalled();
            expect(this.loadingModalService.open).toHaveBeenCalled();
        });

        it('should show notification if requisition group was saveed successfully', function() {
            this.vm.save();

            this.confirmDeferred.resolve();
            this.saveDeferred.resolve(this.requisitionGroup);
            this.loadingDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.notificationService.success).toHaveBeenCalledWith('adminRequisitionGroupView.save.success');
        });

        it('should show notification if requisition group save has failed', function() {
            this.vm.save();

            this.confirmDeferred.resolve();
            this.saveDeferred.reject();
            this.$rootScope.$apply();

            expect(this.notificationService.error).toHaveBeenCalledWith('adminRequisitionGroupView.save.fail');
            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should reload state after successful add', function() {
            this.vm.save();

            this.confirmDeferred.resolve();
            this.saveDeferred.resolve(this.requisitionGroup);
            this.$rootScope.$apply();

            expect(this.stateTrackerService.goToPreviousState)
                .toHaveBeenCalledWith('openlmis.administration.requisitionGroupList');
        });
    });
    // SELV3-337: ends here

    describe('searchForFacilities', function() {

        it('should set facility name param', function() {
            this.vm.facilityName = 'some-name';

            this.vm.searchForFacilities();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.requisitionGroupView', {
                page: this.stateParams.page,
                size: this.stateParams.size,
                id: this.stateParams.id,
                tab: 1,
                facilityName: 'some-name',
                requisitionGroup: this.requisitionGroup
            }, {
                reload: true
            });
        });

        it('should call state go method', function() {
            this.vm.searchForFacilities();

            expect(this.$state.go).toHaveBeenCalled();
        });
    });
});