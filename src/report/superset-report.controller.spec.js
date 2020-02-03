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

describe('SupersetReportController', function() {

    var vm, $controller, $q, $rootScope, reportCode, reportUrl,
        supersetLocaleService, SUPERSET_URL;

    beforeEach(function() {
        SUPERSET_URL = 'http://localhost/superset';
        reportCode = 'reportCode';
        reportUrl = SUPERSET_URL + '/theReport';

        module('report', function($provide) {
            $provide.constant('SUPERSET_URL', SUPERSET_URL);
        });

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');

            supersetLocaleService = $injector.get('supersetLocaleService');
        });

        spyOn(supersetLocaleService, 'changeLocale').andReturn($q.resolve());

        vm = $controller('SupersetReportController', {
            reportCode: reportCode,
            reportUrl: reportUrl
        });
    });

    describe('onInit', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should expose Superset iFrame src', function() {
            expect(vm.reportUrl).toEqual(reportUrl);
        });

        it('should expose report code', function() {
            expect(vm.reportCode).toEqual(reportCode);
        });

        it('should expose authUrl', function() {
            expect(vm.authUrl).not.toBeUndefined();
        });

        it('should expose isReady', function() {
            expect(vm.isReady).toEqual(false);
        });

        it('should adjust language in Superset and change isReady flag', function() {
            $rootScope.$apply();

            expect(supersetLocaleService.changeLocale).toHaveBeenCalled();
            expect(vm.isReady).toBe(true);
        });
    });
});
