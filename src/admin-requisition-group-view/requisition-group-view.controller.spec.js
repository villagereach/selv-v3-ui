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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

describe('RequisitionGroupViewController', function() {

    beforeEach(function() {
        module('admin-requisition-group-view');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.RequisitionGroupDataBuilder = $injector.get('RequisitionGroupDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
        });

        this.requisitionGroup = new this.RequisitionGroupDataBuilder().buildJson();

        this.memberFacilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];

        this.stateParams = {
            page: 0,
            size: 10,
            id: 'group-id',
            tab: 0,
            facilityName: 'facility'
        };

        this.vm = this.$controller('RequisitionGroupViewController', {
            requisitionGroup: this.requisitionGroup,
            memberFacilities: this.memberFacilities,
            $stateParams: this.stateParams
        });
        this.vm.$onInit();

        spyOn(this.$state, 'go').andReturn();
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

    describe('searchForFacilities', function() {

        it('should set facility name param', function() {
            this.vm.facilityName = 'some-name';

            this.vm.searchForFacilities();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.requisitionGroupView', {
                page: this.stateParams.page,
                size: this.stateParams.size,
                id: this.stateParams.id,
                tab: 1,
                facilityName: 'some-name'
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