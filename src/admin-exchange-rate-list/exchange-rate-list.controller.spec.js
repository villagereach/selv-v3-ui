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

describe('ExchangeRateListController', function() {

    beforeEach(function() {
        module('admin-exchange-rate-list');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
        });

        this.currentRate = {
            rate: 64.25,
            validFrom: '2026-06-23T08:29:20Z',
            createdByName: 'Admin Admin'
        };
        this.rates = [this.currentRate];

        this.vm = this.$controller('ExchangeRateListController', {
            currentRate: this.currentRate,
            rates: this.rates
        });
        this.vm.$onInit();
    });

    it('should expose the resolved current rate', function() {
        expect(this.vm.currentRate).toEqual(this.currentRate);
    });

    it('should expose the resolved rate history', function() {
        expect(this.vm.rates).toEqual(this.rates);
    });
});
