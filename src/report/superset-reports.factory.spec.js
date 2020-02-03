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

describe('reportService', function() {

    beforeEach(function() {
        var that = this;

        that.baseUrl = 'http://localhost/superset';

        module('report', function($provide, $stateProvider) {
            that.$stateProvider = $stateProvider;
            $provide.constant('SUPERSET_URL', that.baseUrl);
        });

        inject(function($injector) {
            that.supersetReports = $injector.get('supersetReports');
            that.MODAL_CANCELLED = $injector.get('MODAL_CANCELLED');
            that.openlmisModalService = $injector.get('openlmisModalService');
            that.$q = $injector.get('$q');
            that.$state = $injector.get('$state');
            that.$rootScope = $injector.get('$rootScope');
        });

        that.goToState = function(state) {
            this.$state.go(state);
            this.$rootScope.$apply();
        };

        spyOn(this.$state, 'go').andCallThrough();
    });

    describe('addReporingPages', function() {
        beforeEach(function() {
            this.$stateProvider = jasmine.createSpyObj('$stateProvider', ['state']);
        });

        it('should add reporting pages', function() {
            this.supersetReports.addReporingPages(this.$stateProvider);

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.reportingRateAndTimeliness', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.stockStatus', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.stockouts', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.consumption', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.orders', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.adjustments', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.administrative', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.aggregateConsumption', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.reportedAndOrderedProducts', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.occurrenceOfAdjustments', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.submissionOfMonthlyReports', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.stocksSummary', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.stockOnHandPerInstitution', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.comparisonOfConsumptionByRegion', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.stockoutsInUS', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.rupturasDeStockPorProduto', jasmine.any(Object)
            );
        });

    });

    describe('authorizeInSuperset', function() {
        var testingSupersetReportState = 'openlmis.reports.list.superset.reportingRateAndTimeliness';
        beforeEach(function() {
            this.modalDefer = this.$q.defer();
            var modal = {
                promise: this.modalDefer.promise
            };
            spyOn(this.openlmisModalService, 'createDialog').andReturn(modal);

            this.supersetReports.addReporingPages(this.$stateProvider);
        });

        it('should create the Superset OAuth Login modal', function() {
            this.openlmisModalService.createDialog.andCallFake(function(options) {
                expect(options.controller).toEqual('SupersetOAuthLoginController');
            });

            this.goToState(testingSupersetReportState);

            expect(this.openlmisModalService.createDialog).toHaveBeenCalled();
        });

        it('should not go to a Superset report if an error occurs', function() {
            var previousState = this.$state.current.name;

            this.modalDefer.reject();
            this.goToState(testingSupersetReportState);

            expect(this.$state.current.name).toEqual(previousState);
            expect(this.$state.current.name).not.toEqual(testingSupersetReportState);
        });

        it('should reject the state change if modal is canceled', function() {
            this.modalDefer.reject(this.MODAL_CANCELLED);
            this.goToState(testingSupersetReportState);

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.reports.list');
        });
    });
});
