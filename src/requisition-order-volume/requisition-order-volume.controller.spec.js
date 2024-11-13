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

describe('RequisitionOrderVolumeController', function() {

    beforeEach(function() {
        module('requisition-order-volume');
        module('requisition');
        module('requisition-view-tab');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.requisitionOrderVolumeService = $injector.get('requisitionOrderVolumeService');
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
        });

        this.orderVolume = 6.0;
        var $scope = this.$rootScope.$new();

        this.indicator = this.$controller('RequisitionOrderVolumeController', {
            $scope: $scope,
            requisitionOrderVolumeService: this.requisitionOrderVolumeService
        });

        this.indicator.requisition = new this.RequisitionDataBuilder().build();

        this.indicator.requisition.$availableCceCapacity = 12.0;

    });

    describe('initialization', function() {

        it('should expose requistion', function() {
            expect(this.indicator.requisition).toBeDefined();
        });

        it('should call requisitionOrderVolumeService for order volume', function() {
            spyOn(this.requisitionOrderVolumeService, 'getRequisitionOrderVolume').andReturn(this.orderVolume);

            this.indicator.calculateOrderVolume();

            expect(this.requisitionOrderVolumeService.getRequisitionOrderVolume)
                .toHaveBeenCalledWith(this.indicator.requisition);
        });

        it('should not save $toLargeOrderVolume into requisition', function() {
            spyOn(this.requisitionOrderVolumeService, 'getRequisitionOrderVolume').andReturn(this.orderVolume);

            this.indicator.calculateOrderVolume();

            expect(this.indicator.requisition.$toLargeOrderVolume).toBe(undefined);
        });

        it('should save $toLargeOrderVolume into requisition', function() {
            spyOn(this.requisitionOrderVolumeService, 'getRequisitionOrderVolume').andReturn(14.0);

            this.indicator.calculateOrderVolume();

            expect(this.indicator.requisition.$toLargeOrderVolume).toBe(true);
        });

    });
});
