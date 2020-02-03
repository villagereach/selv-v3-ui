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

describe('supersetLocaleService', function() {

    var supersetLocaleService, $httpBackend, SUPERSET_URL, DEFAULT_LANGUAGE;

    beforeEach(function() {
        SUPERSET_URL = 'http://localhost/superset';
        DEFAULT_LANGUAGE = 'en';

        module('report', function($provide) {
            $provide.constant('SUPERSET_URL', SUPERSET_URL);
            $provide.constant('DEFAULT_LANGUAGE', DEFAULT_LANGUAGE);
        });

        inject(function($injector) {
            supersetLocaleService = $injector.get('supersetLocaleService');
            $httpBackend = $injector.get('$httpBackend');
        });

    });

    describe('changeLocale', function() {

        it('should send change language request', function() {
            $httpBackend.expectGET(SUPERSET_URL + '/lang/change/' + DEFAULT_LANGUAGE);

            supersetLocaleService.changeLocale(DEFAULT_LANGUAGE);
        });

        it('should change the language to default if a not known locale provided', function() {
            $httpBackend.expectGET(SUPERSET_URL + '/lang/change/' + DEFAULT_LANGUAGE);

            supersetLocaleService.changeLocale('not_known_locale');
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

});
