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

(function() {

    'use strict';

    angular.module('admin-requisition-group-add').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.requisitionGroupAdd', {
            showInNavigation: true,
            label: 'adminRequisitionGroupAdd.add',
            url: '/requisitionGroupsAdd',
            controller: 'RequisitionGroupAddController',
            templateUrl: 'admin-requisition-group-add/requisition-group-add.html',
            controllerAs: 'vm',
            accessRights: [ADMINISTRATION_RIGHTS.REQUISITION_GROUPS_MANAGE],
            resolve: {
                requisitionGroup: function(RequisitionGroup) {
                    return new RequisitionGroup({});
                },
                programs: function(programService) {
                    return programService.getAll();
                },
                geographicZones: function(geographicZoneService) {
                    return geographicZoneService.getAll()
                        .then(function(response) {
                            return response.content;
                        });
                },
                supervisoryNodes: function(SupervisoryNodeResource) {
                    return new SupervisoryNodeResource().query()
                        .then(function(response) {
                            return response.content;
                        });
                },
                processingSchedules: function(processingScheduleService) {
                    return processingScheduleService.query()
                        .then(function(response) {
                            return response.content;
                        });
                },
                facilities: function(facilityService) {
                    return facilityService.getAllMinimal();
                },
                facilitiesMap: function(facilities, ObjectMapper) {
                    return new ObjectMapper().map(facilities);
                }
            }
        });
    }
})();
