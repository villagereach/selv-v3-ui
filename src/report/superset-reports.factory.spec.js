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
            // SELV-695: Modify reports page
            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.desempenhoEQualidadeDeDados', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.dpvEAl', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.entregaIntegral', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.consumo', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.entradas', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.saidas', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.despericiosEAjustes', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.datasDeExpiracao', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.movimentos', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.disponibilidadeDeStock', jasmine.any(Object)
            );

            expect(this.$stateProvider.state).toHaveBeenCalledWith(
                'openlmis.reports.list.superset.dasboardCce', jasmine.any(Object)
            );
            // SELV-695: Ends here
        });

    });

});
