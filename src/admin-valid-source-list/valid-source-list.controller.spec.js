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
// SELV3-346 Starts here
describe('ValidSourceListController', function() {

    beforeEach(function() {

        var validSources = [
            {
                programId: 1,
                facilityTypeId: 2,
                name: 'valid source 1',
                geoZoneId: 3,
                geoLevelId: 4
            }
        ];

        module('admin-valid-source-list');
        inject(function($injector) {
            this.$controller = $injector.get('$controller');
        });

        var geoLevelMap = [];
        geoLevelMap[4] = 'geo level 1';

        this.controller = this.$controller('ValidSourceListController', {
            validSources: validSources,
            programsMap: {
                1: 'program 1'
            },
            facilityTypesMap: {
                2: 'type 1'
            },
            geographicZonesMap: {
                3: 'geo zone 1'
            },
            geographicLevelMap: geoLevelMap,
            programs: [
                'program 1'
            ],
            facilities: [
                'type 1'
            ]
        });

    });

    describe('onInit', function() {

        it('should initialize validSources, programsMap, facilityTypesMap, geographicZonesMap, geographicLevelMap',
            function() {
                this.controller.$onInit();

                expect(this.controller.validSources.length).toBe(1);
                expect(this.controller.programsMap[1]).toBe('program 1');
                expect(this.controller.facilityTypesMap[2]).toBe('type 1');
                expect(this.controller.geographicZonesMap[3]).toBe('geo zone 1');
                expect(this.controller.geographicLevelMap[4]).toBe('geo level 1');
            });
    });

});
// SELV3-346 Ends here