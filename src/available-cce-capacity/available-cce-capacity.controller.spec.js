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

describe('AvailableCceCapacityController', function() {

    beforeEach(function() {
        module('available-cce-capacity');
        module('requisition');
        module('requisition-view-tab');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.availableCceCapacityService = $injector.get('availableCceCapacityService');
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
        });

        this.fullVolume = 12;
        this.volumeInUse = 2;

        spyOn(this.availableCceCapacityService, 'getFullCceVolume')
            .andReturn(this.$q.when(this.fullVolume));
        spyOn(this.availableCceCapacityService, 'getCceVolumeInUse')
            .andReturn(this.$q.when(this.volumeInUse));

        this.indicator = this.$controller('AvailableCceCapacityController', {
            availableCceCapacityService: this.availableCceCapacityService
        });

        this.indicator.requisition = new this.RequisitionDataBuilder().build();
    });

    describe('onInit', function() {

        it('should expose requisition property', function() {
            this.indicator.$onInit();

            expect(this.indicator.requisition).toBeDefined();
        });

        it('should expose ready property', function() {
            this.indicator.$onInit();

            expect(this.indicator.ready).toEqual(false);
        });

        it('should expose failed property', function() {
            this.indicator.$onInit();

            expect(this.indicator.failed).toEqual(false);
        });

        it('should call availableCceCapacityService for full volume', function() {
            this.indicator.$onInit();

            expect(this.availableCceCapacityService.getFullCceVolume)
                .toHaveBeenCalledWith(this.indicator.requisition.facility.id);
        });

        it('should call availableCceCapacityService for volume in use', function() {
            this.indicator.$onInit();

            expect(this.availableCceCapacityService.getCceVolumeInUse)
                .toHaveBeenCalledWith(this.indicator.requisition.facility.id);
        });

        it('should calculate availableVolume', function() {
            this.indicator.$onInit();

            expect(this.availableVolume).toBeUndefined();

            this.$rootScope.$apply();

            expect(this.indicator.availableVolume).toBe(10);
            expect(this.indicator.requisition.$availableCceCapacity).toBe(10);
            expect(this.indicator.ready).toBe(true);
            expect(this.indicator.failed).toBe(false);
        });

        it('should set failed flag to true when getting full volume failed', function() {
            this.availableCceCapacityService.getFullCceVolume.andReturn(this.$q.reject());
            this.indicator.$onInit();

            this.$rootScope.$apply();

            expect(this.indicator.availableVolume).toBeUndefined();
            expect(this.indicator.requisition.$availableCceCapacity).toBeUndefined();
            expect(this.indicator.ready).toBe(false);
            expect(this.indicator.failed).toBe(true);
        });

        it('should set failed flag to true when getting volume in use failed', function() {
            this.availableCceCapacityService.getCceVolumeInUse.andReturn(this.$q.reject());
            this.indicator.$onInit();

            this.$rootScope.$apply();

            expect(this.indicator.availableVolume).toBeUndefined();
            expect(this.indicator.requisition.$availableCceCapacity).toBeUndefined();
            expect(this.indicator.ready).toBe(false);
            expect(this.indicator.failed).toBe(true);
        });
    });
});
