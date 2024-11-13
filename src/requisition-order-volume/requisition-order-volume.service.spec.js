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

describe('requisitionOrderVolumeService', function() {

    beforeEach(function() {
        module('requisition-order-volume');
        module('requisition');
        module('requisition-view-tab');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.requisitionOrderVolumeService = $injector.get('requisitionOrderVolumeService');
            this.calculationFactory = $injector.get('calculationFactory');
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
        });

        this.lineItems = [
            createLineItem(false, 200, 8),
            createLineItem(false, 100, 7),
            createLineItem(false, 400, 6),
            createLineItem(true, 200, 8),
            createLineItem(false, 200, 12)
        ];

        this.requisition = new this.RequisitionDataBuilder()
            .withRequisitionLineItems(this.lineItems)
            .buildJson();

        this.packsToShip = 2;
    });

    describe('getRequisitionOrderVolume', function() {

        it('should call calculationFactory', function() {
            spyOn(this.calculationFactory, 'packsToShip').andReturn(this.packsToShip);

            this.requisitionOrderVolumeService.getRequisitionOrderVolume(this.requisition);

            expect(this.calculationFactory.packsToShip).toHaveBeenCalledWith(this.lineItems[0], this.requisition);
        });

        it('should return order volume', function() {
            spyOn(this.calculationFactory, 'packsToShip').andReturn(this.packsToShip);

            var result = this.requisitionOrderVolumeService.getRequisitionOrderVolume(this.requisition);

            expect(result).toEqual(14.0);

        });
    });

    function createLineItem(skipped, volume, maxTemp) {
        var lineItem = {
            skipped: skipped,
            orderable: {
                netContent: 10,
                inBoxCubeDimension: {
                    value: volume,
                    measurementUnitCode: 'MLT'
                },
                maximumTemperature: {
                    value: maxTemp,
                    temperatureMeasurementUnitCode: 'CEL'
                }
            }
        };

        return lineItem;
    }

});
