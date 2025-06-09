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

describe('stockCardService', function() {

    beforeEach(function() {
        module('stock-card');
        module('referencedata-lot');

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$httpBackend = $injector.get('$httpBackend');
            this.stockCardService = $injector.get('stockCardService');
            this.StockCardResource = $injector.get('StockCardResource');
            this.stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            this.accessTokenFactory = $injector.get('accessTokenFactory');
            this.dateUtils = $injector.get('dateUtils');
            this.StockCardDataBuilder = $injector.get('StockCardDataBuilder');
            this.LotDataBuilder = $injector.get('LotDataBuilder');
        });

        this.stockCard1 = new this.StockCardDataBuilder()
            .withLot(new this.LotDataBuilder().build())
            .build();
        this.stockCard2 = new this.StockCardDataBuilder()
            .withLot(new this.LotDataBuilder().build())
            .build();

        this.stockCardIds = [this.stockCard1.id, this.stockCard2.id];
    });

    describe('getStockCard', function() {
        it('should return promise', function() {
            var result = this.stockCardService.getStockCard(this.stockCard1.id);

            expect(result.then).not.toBeUndefined();
        });
    });

    describe('updateStockCardStatus', function() {

        beforeEach(function() {
            this.$httpBackend.when('PUT',
                this.stockmanagementUrlFactory('/api/stockCards/deactivate?stockCardIds=' + this.stockCard1.id +
                    '&stockCardIds=' + this.stockCard2.id))
                .respond(200);
        });

        it('should return promise', function() {
            var result = this.stockCardService.deactivateStockCards(this.stockCardIds);
            this.$httpBackend.flush();

            expect(result.then).not.toBeUndefined();
        });
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingRequest();
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

});