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

describe('openlmis.administration.exchangeRate state', function() {

    'use strict';

    beforeEach(function() {
        var test = this;
        module('admin-exchange-rate-list', function($provide) {
            test.getSpy = jasmine.createSpy('get');
            test.querySpy = jasmine.createSpy('query');

            $provide.factory('ExchangeRateResource', function() {
                return function() {
                    this.get = test.getSpy;
                    this.query = test.querySpy;
                };
            });
        });

        inject(function($injector) {
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.$templateCache = $injector.get('$templateCache');
        });

        this.currentRate = {
            rate: 64.25,
            validFrom: '2026-06-23T08:29:20Z',
            createdByName: 'Admin Admin'
        };

        this.getSpy.andReturn(this.$q.when(this.currentRate));
        this.querySpy.andReturn(this.$q.when([this.currentRate]));

        this.$state.go('openlmis');
        this.$rootScope.$apply();

        this.goToUrl = function(url) {
            this.$location.url(url);
            this.$rootScope.$apply();
        };

        this.getResolvedValue = function(name) {
            return this.$state.$current.locals.globals[name];
        };
    });

    it('should be available under /administration/exchangeRate URL', function() {
        expect(this.$state.current.name).not.toEqual('openlmis.administration.exchangeRate');

        this.goToUrl('/administration/exchangeRate');

        expect(this.$state.current.name).toEqual('openlmis.administration.exchangeRate');
    });

    it('should use html template', function() {
        spyOn(this.$templateCache, 'get').andCallThrough();

        this.goToUrl('/administration/exchangeRate');

        expect(this.$templateCache.get)
            .toHaveBeenCalledWith('admin-exchange-rate-list/exchange-rate-list.html');
    });

    it('should resolve the current rate', function() {
        this.goToUrl('/administration/exchangeRate');

        expect(this.getResolvedValue('currentRate')).toEqual(this.currentRate);
        expect(this.getSpy).toHaveBeenCalledWith('current');
    });

    it('should resolve undefined current rate when the request fails', function() {
        this.getSpy.andReturn(this.$q.reject());

        this.goToUrl('/administration/exchangeRate');

        expect(this.getResolvedValue('currentRate')).toBeUndefined();
    });

    it('should resolve the rate history', function() {
        this.goToUrl('/administration/exchangeRate');

        expect(this.getResolvedValue('rates').length).toEqual(1);
        expect(this.querySpy).toHaveBeenCalled();
    });
});
