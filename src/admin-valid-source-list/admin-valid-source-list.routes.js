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
(function() {

    'use strict';

    angular.module('admin-valid-source-list').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.validSources', {
            showInNavigation: true,
            label: 'adminValidSourceList.validSources',
            url: '/validSources?page&size',
            controller: 'ValidSourceListController',
            templateUrl: 'admin-valid-source-list/valid-source-list.html',
            controllerAs: 'vm',
            accessRights: [ADMINISTRATION_RIGHTS.FACILITIES_MANAGE],
            resolve: {
                validSourcesData: function(paginationService, ValidSourceResource, $stateParams) {
                    return paginationService.registerUrl($stateParams, function(params) {
                        return new ValidSourceResource().query({
                            size: params.size,
                            page: params.page
                        });
                    });
                },
                facilities: function($q, validSourcesData, FacilityResource) {
                    var deferred = $q.defer();
                    var promises = [];
                    var result = [];
                    var facilityResource = new FacilityResource();

                    angular.forEach(validSourcesData, function(validSource) {
                        promises.push(
                            facilityResource.get(validSource.node.referenceId)
                                .then(function(response) {
                                    result[response.id] = response;
                                })
                        );
                    });

                    $q.all(promises).then(function() {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                validSources: function(validSourcesData, FacilityResource, facilities) {
                    var result = [];

                    angular.forEach(validSourcesData, function(validSource) {
                        var item = {
                            programId: validSource.programId,
                            facilityTypeId: validSource.facilityTypeId,
                            name: validSource.name
                        };

                        if (validSource.node.refDataFacility) {
                            var id = validSource.node.referenceId;
                            item.geoZoneId = facilities[id].geographicZone.id;
                            item.geoLevelId = facilities[id].geographicZone.level.id;
                        }

                        result.push(item);
                    });

                    return result;
                },
                programs: function(programService) {
                    return programService.getAll();
                },
                facilityTypes: function(facilityTypeService) {
                    return facilityTypeService.query({
                        active: true
                    })
                        .then(function(response) {
                            return response.content;
                        });
                },
                facilityTypesMap: function(facilityTypes, ObjectMapper) {
                    return new ObjectMapper().map(facilityTypes, 'name');
                },
                programsMap: function(programs, ObjectMapper) {
                    return new ObjectMapper().map(programs, 'name');
                },
                geographicZones: function($q, geographicZoneService) {
                    var deferred = $q.defer();

                    geographicZoneService.getAll().then(function(response) {
                        deferred.resolve(response.content);
                    }, deferred.reject);

                    return deferred.promise;
                },
                geographicZonesMap: function(geographicZones, ObjectMapper) {
                    return new ObjectMapper().map(geographicZones, 'name');
                },
                geographicLevelMap: function(geographicZones) {
                    var levels = [];

                    angular.forEach(geographicZones, function(zone) {
                        levels[zone.level.id] = zone.level.name;
                    });

                    return levels;
                }
            }
        });
    }
})();
// SELV3-346 Ends here