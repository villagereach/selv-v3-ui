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
                'openlmis.reports.list.superset.covid', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.aviamentos', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.stock', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.visaoGeral', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.qualidadeDados', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.niveisDeStock', jasmine.any(Object)
            );

        });

    });

});
