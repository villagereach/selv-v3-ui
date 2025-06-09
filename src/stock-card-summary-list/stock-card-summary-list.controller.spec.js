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

describe('StockCardSummaryListController', function() {

    var implMock, accessTokenFactory, $window;

    beforeEach(function() {

        module('stock-card-summary-list', function($provide) {
            implMock = jasmine.createSpyObj('impl', ['print']);

            $provide.factory('StockCardSummaryRepositoryImpl', function() {
                return function() {
                    return implMock;
                };
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.scope = this.$rootScope.$new();
            this.StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            this.offlineService = $injector.get('offlineService');
            accessTokenFactory = $injector.get('accessTokenFactory');
            $window = $injector.get('$window');
        });

        this.stockCardSummaries = [
            new this.StockCardSummaryDataBuilder().build(),
            new this.StockCardSummaryDataBuilder().build()
        ];

        this.stockCardSummaries2 = [
            new this.StockCardSummaryDataBuilder().build(),
            new this.StockCardSummaryDataBuilder().build()
        ];

        this.stateParams = {
            param: 'param'
        };

        spyOn(this.offlineService, 'isOffline').andReturn(true);

        this.vm = this.$controller('StockCardSummaryListController', {
            stockCardSummaries: this.stockCardSummaries,
            displayStockCardSummaries: this.stockCardSummaries,
            $stateParams: this.stateParams,
            $scope: this.scope
        });
        this.vm.$onInit();

        this.vm.facility = {
            id: 'facility'
        };
        this.vm.program = {
            id: 'program'
        };
        this.vm.isSupervised = true;
        this.vm.includeInactive = false;
        this.vm.productCode = 'product code';
        this.vm.productName = 'product name';
        this.vm.lotCode = 'lot code';

        spyOn(this.$state, 'go').andReturn(true);
        spyOn(accessTokenFactory, 'addAccessToken').andCallThrough();
        spyOn($window, 'open').andCallThrough();
    });

    describe('onInit', function() {

        it('should expose stockCardSummaries', function() {
            expect(this.vm.stockCardSummaries).toEqual(this.stockCardSummaries);
        });

        it('should watch stockCardSummaries when offline', function() {
            this.vm.displayStockCardSummaries = undefined;
            this.vm.pagedList = this.stockCardSummaries2;

            this.$rootScope.$apply();

            expect(this.vm.displayStockCardSummaries).toEqual(this.stockCardSummaries2);
        });
    });

    describe('loadStockCardSummaries', function() {

        it('should call state go with proper parameters', function() {
            this.vm.loadStockCardSummaries();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', {
                param: 'param',
                facility: 'facility',
                stockCardSummariesPage: 0,
                stockCardSummariesSize: 10,
                program: 'program',
                active: 'ACTIVE',
                supervised: true,
                productCode: 'product code',
                productName: 'product name',
                lotCode: 'lot code',
                includeInactive: false
            }, {
                reload: true
            });
        });
    });

    describe('viewSingleCard', function() {

        it('should call state go with proper parameters', function() {
            this.vm.viewSingleCard('stock-card-id');

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                stockCardId: 'stock-card-id'
            });
        });
    });

    describe('print', function() {

        beforeEach(function() {
            this.vm.$onInit();
        });

        it('should open the window', function() {
            this.vm.print();

            expect($window.open).toHaveBeenCalled();
            expect(accessTokenFactory.addAccessToken).toHaveBeenCalled();
        });
    });

    describe('goToPendingOfflineEventsPage', function() {

        it('should call state go method', function() {
            this.vm.goToPendingOfflineEventsPage();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.pendingOfflineEvents');
        });
    });

    describe('search', function() {
        it('should search with set params', function() {
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith(
                'openlmis.stockmanagement.stockCardSummaries',
                {
                    param: 'param',
                    stockCardSummariesPage: 0,
                    stockCardSummariesSize: 10,
                    facility: 'facility',
                    program: 'program',
                    supervised: true,
                    includeInactive: false,
                    productCode: 'product code',
                    productName: 'product name',
                    lotCode: 'lot code',
                    page: 0,
                    size: 10
                },
                {
                    reload: true
                }
            );
        });
    });
});
