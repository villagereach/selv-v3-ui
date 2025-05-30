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

    angular
        .module('stock-issue-creation')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'SEARCH_OPTIONS', 'ADJUSTMENT_TYPE', 'moment'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, SEARCH_OPTIONS, ADJUSTMENT_TYPE, moment) {
        $stateProvider.state('openlmis.stockmanagement.issue.creation', {
            isOffline: true,
            url: '/:programId/create?page&size&keyword',
            views: {
                '@openlmis': {
                    controller: 'StockAdjustmentCreationController',
                    templateUrl: 'stock-adjustment-creation/adjustment-creation.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            params: {
                program: undefined,
                facility: undefined,
                stockCardSummaries: undefined,
                reasons: undefined,
                displayItems: undefined,
                addedLineItems: undefined,
                orderableGroups: undefined,
                srcDstAssignments: undefined
            },
            resolve: {
                program: function($stateParams, programService) {
                    if (_.isUndefined($stateParams.program)) {
                        return programService.get($stateParams.programId);
                    }
                    return $stateParams.program;
                },
                facility: function($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                orderableGroups: function($stateParams, program, facility, existingStockOrderableGroupsFactory) {
                    if (!$stateParams.orderableGroups) {
                        $stateParams.orderableGroups = existingStockOrderableGroupsFactory
                            .getGroupsWithNotZeroSoh($stateParams, program, facility)
                            .then(function(orderableGroups) {
                                var currentDate = moment(new Date()).format('YYYY-MM-DD');
                                var filteredGroups = [];
                                orderableGroups.forEach(function(orderableGroup) {
                                    var group = orderableGroup.filter(function(orderable) {
                                        return orderable.lot === null ||
                                            moment(orderable.lot.expirationDate).format('YYYY-MM-DD') >= currentDate;
                                    });
                                    if (group.length !== 0) {
                                        filteredGroups.push(group);
                                    }
                                });
                                return filteredGroups;
                            });
                    }
                    return $stateParams.orderableGroups;
                },
                displayItems: function($stateParams, registerDisplayItemsService) {
                    return registerDisplayItemsService($stateParams);
                },
                defaultReason: function(AdminReasonAddService) {
                    return new AdminReasonAddService().getReason('@@DEFAULT_ISSUE_REASON_ID');
                },
                reasons: function(defaultReason) {
                    return [defaultReason];
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.ISSUE;
                },
                srcDstAssignments: function($stateParams, facility, sourceDestinationService) {
                    if (_.isUndefined($stateParams.srcDstAssignments)) {
                        return sourceDestinationService.getDestinationAssignments(
                            $stateParams.programId, facility.id
                        );
                    }
                    return $stateParams.srcDstAssignments;
                },
                hasPermissionToAddNewLot: function() {
                    return false;
                }
            }
        });
    }
})();
