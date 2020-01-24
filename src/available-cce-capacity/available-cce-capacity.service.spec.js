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

describe('availableCceCapacityService', function() {

    beforeEach(function() {
        module('available-cce-capacity');
        module('requisition');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.availableCceCapacityService = $injector.get('availableCceCapacityService');
            this.CceVolumeResource = $injector.get('CceVolumeResource');
            this.StockCardSummaryResource = $injector.get('StockCardSummaryResource');
            this.StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            this.RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
        });

        this.cceVolume = {
            volume: 12
        };

        this.orderable1 = new this.OrderableDataBuilder().buildForCce(100, 2, 8);
        this.orderable2 = new this.OrderableDataBuilder().buildForCce(undefined, 2, 8);
        this.orderable3 = new this.OrderableDataBuilder().buildForCce(300, undefined, 8);
        this.orderable4 = new this.OrderableDataBuilder().buildForCce(400, 2, undefined);
        this.orderable5 = new this.OrderableDataBuilder().buildForCce(500, 2, 9);
        this.orderable6 = new this.OrderableDataBuilder().buildForCce(600, 2, 7);
        this.orderable7 = new this.OrderableDataBuilder().buildForCce(700, 2, 8);

        this.requisition = new this.RequisitionDataBuilder()
            .withRequisitionLineItems([
                new this.RequisitionLineItemDataBuilder()
                    .withOrderable(this.orderable1)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .withOrderable(this.orderable2)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .withOrderable(this.orderable3)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .withOrderable(this.orderable4)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .withOrderable(this.orderable5)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .withOrderable(this.orderable6)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .withOrderable(this.orderable7)
                    .buildJson()
            ])
            .buildJson();

        this.summary1 = new this.StockCardSummaryDataBuilder()
            .withStockOnHand(1)
            .withOrderable(this.orderable1)
            .build();
        this.summary2 = new this.StockCardSummaryDataBuilder()
            .withStockOnHand(2)
            .withOrderable(this.orderable2)
            .build();
        this.summary3 = new this.StockCardSummaryDataBuilder()
            .withStockOnHand(3)
            .withOrderable(this.orderable3)
            .build();
        this.summary4 = new this.StockCardSummaryDataBuilder()
            .withStockOnHand(4)
            .withOrderable(this.orderable4)
            .build();
        this.summary5 = new this.StockCardSummaryDataBuilder()
            .withStockOnHand(5)
            .withOrderable(this.orderable5)
            .build();
        this.summary6 = new this.StockCardSummaryDataBuilder()
            .withStockOnHand(6)
            .withOrderable(this.orderable6)
            .build();
        this.summariesPage = {
            content: [
                this.summary1,
                this.summary2,
                this.summary3,
                this.summary4,
                this.summary5,
                this.summary6
            ]
        };

        spyOn(this.CceVolumeResource.prototype, 'query')
            .andReturn(this.$q.resolve(this.cceVolume));

        spyOn(this.StockCardSummaryResource.prototype, 'query')
            .andReturn(this.$q.when(this.summariesPage));
    });

    describe('getFullCceVolume', function() {

        it('should call CCE service', function() {
            var result;

            this.availableCceCapacityService.getFullCceVolume('facility-id')
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(this.CceVolumeResource.prototype.query).toHaveBeenCalledWith({
                facilityId: 'facility-id'
            });

            expect(result).toEqual(this.cceVolume.volume);
        });
    });

    describe('getCceVolumeInUse', function() {

        it('should not call stock management service if there is no CCE orderables', function() {
            var result,
                requisition = new this.RequisitionDataBuilder()
                    .withRequisitionLineItems([
                        new this.RequisitionLineItemDataBuilder()
                            .withOrderable(this.orderable2)
                            .buildJson()
                    ])
                    .buildJson();

            this.availableCceCapacityService.getCceVolumeInUse(requisition)
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(this.StockCardSummaryResource.prototype.query).not.toHaveBeenCalled();
            expect(result).toEqual(0);
        });

        it('should call stock management service with filtered orderable ids', function() {
            var result;

            this.availableCceCapacityService.getCceVolumeInUse(this.requisition)
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(this.StockCardSummaryResource.prototype.query).toHaveBeenCalledWith({
                orderableId: [
                    this.orderable1.id,
                    this.orderable6.id,
                    this.orderable7.id
                ],
                facilityId: this.requisition.facility.id,
                programId: this.requisition.program.id,
                nonEmptyOnly: true
            });

            expect(result).toEqual(3.7);
        });
    });
});
