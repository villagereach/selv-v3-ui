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

describe('ExchangeRateAddController', function() {

    beforeEach(function() {
        var test = this;
        module('admin-exchange-rate-add', function($provide) {
            test.createSpy = jasmine.createSpy('create');

            $provide.factory('ExchangeRateResource', function() {
                return function() {
                    this.create = test.createSpy;
                };
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.loadingModalService = $injector.get('loadingModalService');
            this.notificationService = $injector.get('notificationService');
        });

        spyOn(this.loadingModalService, 'open').andReturn(this.$q.when());
        spyOn(this.loadingModalService, 'close').andReturn();
        spyOn(this.notificationService, 'success').andReturn();
        spyOn(this.notificationService, 'error').andReturn();
        spyOn(this.$state, 'go').andReturn();

        this.vm = this.$controller('ExchangeRateAddController', {});
        this.vm.$onInit();
        this.vm.rate = 64.25;
    });

    it('should create the rate and reload the list on success', function() {
        this.createSpy.andReturn(this.$q.when());

        this.vm.addRate();
        this.$rootScope.$apply();

        expect(this.createSpy).toHaveBeenCalledWith({
            rate: 64.25
        });

        expect(this.notificationService.success)
            .toHaveBeenCalledWith('adminExchangeRateAdd.create.success');

        expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.exchangeRate', {}, {
            reload: true
        });
    });

    it('should notify the user when creating the rate fails', function() {
        this.createSpy.andReturn(this.$q.reject());

        this.vm.addRate();
        this.$rootScope.$apply();

        expect(this.notificationService.error)
            .toHaveBeenCalledWith('adminExchangeRateAdd.create.failure');

        expect(this.$state.go).not.toHaveBeenCalled();
    });

    it('should surface the backend error message on create failure', function() {
        this.createSpy.andReturn(this.$q.reject({
            data: {
                message: 'Exchange rate must be a positive number'
            }
        }));

        this.vm.addRate();
        this.$rootScope.$apply();

        expect(this.notificationService.error)
            .toHaveBeenCalledWith('Exchange rate must be a positive number');
    });
});
