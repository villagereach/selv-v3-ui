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

describe('sourceDestinationService', function() {
    beforeEach(function() {
        this.homeFacilityId = 'home-facility-id';

        var validSources = [
            {
                facilityTypeId: 'fac-type-id-1',
                id: 'source-id-1',
                name: 'source one',
                programId: 'program-id-1',
                facilityId: this.homeFacilityId
            }
        ];
        this.validSources = validSources;

        var validDestinations = [
            {
                facilityTypeId: 'fac-type-id-1',
                id: 'dest-id-1',
                name: 'destination one',
                programId: 'program-id-1',
                facilityId: this.homeFacilityId
            }
        ];
        this.validDestinations = validDestinations;

        module('stock-adjustment-creation', function($provide) {
            $provide.factory('ValidSourceResource', function() {
                return jasmine.createSpy('ValidSourceResource').andReturn(
                    {
                        query: function() {
                            // eslint-disable-next-line no-undef
                            return new Promise(function(resolve) {
                                return resolve(validSources);
                            });
                        }
                    }
                );
            });

            $provide.factory('ValidDestinationResource', function() {
                return jasmine.createSpy('ValidDestinationResource').andReturn(
                    {
                        query: function() {
                            // eslint-disable-next-line no-undef
                            return new Promise(function(resolve) {
                                return resolve(validDestinations);
                            });
                        }
                    }
                );
            });
        });

        inject(function($injector) {
            this.sourceDestinationService = $injector.get('sourceDestinationService');
        });

    });

    describe('getSourceAssignments', function() {

        it('should get source assignments', function() {
            var expected = this.validSources;

            this.sourceDestinationService.getSourceAssignments(this.validSources[0].programId, this.homeFacilityId)
                .then(function(response) {
                    expect(response).toBe(expected);
                });
        });
    });

    describe('getDestinationAssignments', function() {

        it('should get destination assignments', function() {
            var expected = this.validDestinations;

            this.sourceDestinationService.getDestinationAssignments(
                this.validDestinations[0].programId, this.homeFacilityId
            ).then(function(response) {
                expect(response).toBe(expected);
            });
        });
    });
});
