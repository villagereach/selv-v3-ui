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

    var lineItems, vm;

    beforeEach(function() {

        module('requisition-order-volume');

        lineItems = [
            createLineItem(false, true, 1),
            createLineItem(false, true, 2),
            createLineItem(false, false, 2),
            createLineItem(false, false, 2)
        ];

        inject(function(_$filter_, $controller) {

            var requisitionMock = jasmine.createSpyObj('requisition', ['$isAfterAuthorize']);
            var templateMock = jasmine.createSpyObj('template', ['getColumn']);
            templateMock.getColumn.andReturn({
                name: 'orderQuantity',
                $display: true
            });
            requisitionMock.template = templateMock;
            requisitionMock.$isAfterAuthorize.andReturn(false);
            requisitionMock.requisitionLineItems = lineItems;
            requisitionMock.program = {
                showNonFullSupplyTab: true
            };

            vm = $controller('RequisitionOrderVolumeController', {
                $scope: {
                    requisition: requisitionMock
                }
            });
        });

    });

    describe('initialization', function() {

        it('should expose requistion', function() {
            expect(vm.requisition).not.toBeUndefined();
        });

    });

    describe('calculateOrderVolume', function() {

        it('should calculate total order volume correctly', function() {
            expect(vm.calculateOrderVolume().toFixed(1)).toBe('14.0');
        });

        it('should skip skipped line items', function() {
            lineItems[0].skipped = true;
            lineItems[2].skipped = true;

            expect(vm.calculateOrderVolume().toFixed(1)).toBe('8.0');
        });

        it('should skip line items with maximum Tolerance Temperature greater than 8', function() {
            lineItems[0].orderable.maximumToleranceTemperature.value = 12;

            expect(vm.calculateOrderVolume().toFixed(1)).toBe('12.0');
        });

        it('should skip line items when maximumToleranceTemperature and ' +
            'inBoxCubeDimension are not defined', function() {
            lineItems[0].orderable.maximumToleranceTemperature = undefined;
            lineItems[0].orderable.inBoxCubeDimension = undefined;

            expect(vm.calculateOrderVolume().toFixed(1)).toBe('12.0');
        });

    });

    function createLineItem(skipped, fullSupply, packsToShip) {
        var lineItem = {
            skipped: skipped,
            $program: {
                fullSupply: fullSupply
            },
            packsToShip: packsToShip,
            orderable: {
                netContent: 10,
                inBoxCubeDimension: {
                    value: 200,
                    measurementUnitCode: 'MLT'
                },
                maximumToleranceTemperature: {
                    value: 8,
                    temperatureMeasurementUnitCode: 'CEL'
                }
            }
        };

        return lineItem;
    }

});
