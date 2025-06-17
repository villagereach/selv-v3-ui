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

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');

            this.availableCceCapacityService = $injector.get('availableCceCapacityService');
            this.programService = $injector.get('programService');
            this.permissionService = $injector.get('permissionService');
            this.authorizationService = $injector.get('authorizationService');
            this.OrderableResource = $injector.get('OrderableResource');
            this.CceVolumeResource = $injector.get('CceVolumeResource');
            this.StockCardSummaryResource = $injector.get('StockCardSummaryResource');

            this.StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.STOCKMANAGEMENT_RIGHTS = $injector.get('STOCKMANAGEMENT_RIGHTS');
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
        this.orderablePage = {
            content: [
                this.orderable1,
                this.orderable2,
                this.orderable3,
                this.orderable4,
                this.orderable5,
                this.orderable6,
                this.orderable7
            ]
        };

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
                this.summary6
            ]
        };

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.filteredPrograms = this.programs;

        this.user = {
            //eslint-disable-next-line camelcase
            user_id: 'id_1'
        };

        spyOn(this.CceVolumeResource.prototype, 'query')
            .andReturn(this.$q.resolve(this.cceVolume));
        spyOn(this.OrderableResource.prototype, 'query')
            .andReturn(this.$q.resolve(this.orderablePage));
        spyOn(this.StockCardSummaryResource.prototype, 'query')
            .andReturn(this.$q.resolve(this.summariesPage));
        spyOn(this.programService, 'getAll')
            .andReturn(this.$q.resolve(this.programs));
        spyOn(this.permissionService, 'hasPermission')
            .andReturn(this.$q.resolve(true));
        spyOn(this.authorizationService, 'getUser')
            .andReturn(this.user);

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

        var facilityId = 'facility-id-1',
            result;

        beforeEach(function() {
            this.availableCceCapacityService.getCceVolumeInUse(facilityId).then(function(response) {
                result = response;
            });
            this.$rootScope.$apply();
        });

        it('should call programService', function() {
            expect(this.programService.getAll).toHaveBeenCalled();
        });

        it('should call OrderableResource', function() {
            expect(this.OrderableResource.prototype.query).toHaveBeenCalled();
        });

        it('should call StockCardSummaryResource for each program', function() {

            expect(this.StockCardSummaryResource.prototype.query)
                .toHaveBeenCalledWith({
                    orderableId: [
                        this.orderable1.id,
                        this.orderable6.id,
                        this.orderable7.id
                    ],
                    facilityId: facilityId,
                    programId: this.programs[0].id,
                    nonEmptyOnly: true
                }, this.programs[0].id + '/' + facilityId + '/' + this.user.user_id);

            expect(this.StockCardSummaryResource.prototype.query)
                .toHaveBeenCalledWith({
                    orderableId: [
                        this.orderable1.id,
                        this.orderable6.id,
                        this.orderable7.id
                    ],
                    facilityId: facilityId,
                    programId: this.programs[1].id,
                    nonEmptyOnly: true
                }, this.programs[1].id + '/' + facilityId + '/' + this.user.user_id);
        });

        it('should calculate used CCE volume properly', function() {
            expect(result).toEqual(7.4);
        });
    });
});
