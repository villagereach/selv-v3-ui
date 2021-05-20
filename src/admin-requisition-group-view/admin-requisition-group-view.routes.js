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

    angular.module('admin-requisition-group-view').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.requisitionGroupView', {
            label: 'adminRequisitionGroupView.viewRequisitionGroup',
            // SELV3-337: Added the ability to add facility to the requisition group
            params: {
                requisitionGroup: undefined
            },
            // SELV3-337: ends here
            url: '/requisitionGroups/:id?tab&facilityName&memberFacilitiesPage&memberFacilitiesSize',
            accessRights: [ADMINISTRATION_RIGHTS.REQUISITION_GROUPS_MANAGE],
            views: {
                '@openlmis': {
                    controller: 'RequisitionGroupViewController',
                    templateUrl: 'admin-requisition-group-view/requisition-group-view.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                requisitionGroup: function(requisitionGroupService, $stateParams) {
                    // SELV3-337: Added the ability to add facility to the requisition group
                    if (!$stateParams.requisitionGroup) {
                        return requisitionGroupService.get($stateParams.id)
                            .then(function(response) {
                                $stateParams.requisitionGroup = response;
                                return response;
                            });
                    }
                    return $stateParams.requisitionGroup;
                    // SELV3-337: ends here
                },
                memberFacilities: function($stateParams, paginationService, requisitionGroup, facilityFactory) {
                    return paginationService.registerList(null, $stateParams, function(stateParams) {
                        if (stateParams.page && stateParams.size) {
                            $stateParams.tab = 1;
                        }
                        return facilityFactory.searchAndOrderFacilities(
                            requisitionGroup.memberFacilities, $stateParams.facilityName, 'name'
                        );
                    }, {
                        paginationId: 'memberFacilities'
                    });
                },
                // SELV3-337: Added the ability to add facility to the requisition group
                facilities: function(facilityService) {
                    return facilityService.getAllMinimal()
                        .then(function(response) {
                            return response;
                        });
                }
                // SELV3-337: ends here
            }
        });
    }
})();