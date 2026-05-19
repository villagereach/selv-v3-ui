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

describe('availableCceCapacityService', function() {

    beforeEach(function() {
        module('available-cce-capacity');

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$httpBackend = $injector.get('$httpBackend');
            this.stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            this.availableCceCapacityService = $injector.get('availableCceCapacityService');
        });

        this.facilityId = 'facility-id-1';
        this.url = this.stockmanagementUrlFactory(
            '/api/stockCardSummaries/cce/capacity?facilityId=' + this.facilityId
        );
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });

    describe('getAvailableCceVolume', function() {

        it('should call the cce capacity endpoint and resolve to availableVolume', function() {
            this.$httpBackend.expectGET(this.url).respond(200, {
                totalVolume: 20,
                volumeInUse: 5,
                availableVolume: 15
            });

            var result;
            this.availableCceCapacityService.getAvailableCceVolume(this.facilityId)
                .then(function(volume) {
                    result = volume;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result).toEqual(15);
        });

        it('should reject when the endpoint fails', function() {
            this.$httpBackend.expectGET(this.url).respond(500);

            var rejected = false;
            this.availableCceCapacityService.getAvailableCceVolume(this.facilityId)
                .catch(function() {
                    rejected = true;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });
    });
});
