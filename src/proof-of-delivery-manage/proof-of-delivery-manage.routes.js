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
        .module('proof-of-delivery-manage')
        .config(routes);

    routes.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider, FULFILLMENT_RIGHTS) {

        $stateProvider.state('openlmis.orders.podManage', {
            showInNavigation: true,
            label: 'proofOfDeliveryManage.managePods',
            url: '/manage?programId&requestingFacilityId&supplyingFacilityId&status' +
                 '&periodStartDate&periodEndDate&processingSchedule&processingPeriodId&page&size',
            controller: 'ProofOfDeliveryManageController',
            controllerAs: 'vm',
            templateUrl: 'proof-of-delivery-manage/proof-of-delivery-manage.html',
            params: {
                sort: ['createdDate,desc']
            },
            accessRights: [
                FULFILLMENT_RIGHTS.PODS_MANAGE,
                FULFILLMENT_RIGHTS.PODS_VIEW,
                FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
            ],
            resolve: {
                programs: function(programService, authorizationService) {
                    return programService.getUserPrograms(authorizationService.getUser().user_id);
                },
                supplyingFacilities: function(facilityFactory) {
                    return facilityFactory.getSupervisedFacilitiesBasedOnRights([
                        FULFILLMENT_RIGHTS.SHIPMENTS_EDIT,
                        FULFILLMENT_RIGHTS.SHIPMENTS_VIEW
                    ]);
                },
                requestingFacilities: function(facilityFactory) {
                    return facilityFactory.getSupervisedFacilitiesBasedOnRights([
                        FULFILLMENT_RIGHTS.PODS_MANAGE,
                        FULFILLMENT_RIGHTS.PODS_VIEW
                    ]);
                },
                pods: function(paginationService, orderRepository, $stateParams, programs, requestingFacilities) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        if (programs.length === 1 && !stateParams.programId) {
                            stateParams.programId = programs[0].id;
                        }
                        if (requestingFacilities.length === 1 && !stateParams.requestingFacilityId) {
                            stateParams.requestingFacilityId = requestingFacilities[0].id;
                        }

                        if (stateParams.programId &&
                            (stateParams.supplyingFacilityId || stateParams.requestingFacilityId)) {
                            return orderRepository.search(stateParams);
                        }
                        return undefined;
                    });
                },
                processingSchedules: function(processingScheduleService) {
                    return processingScheduleService.get();
                },
                selectedProcessingSchedule: function($stateParams, $filter, processingSchedules) {
                    if ($stateParams.processingSchedule) {
                        return $filter('filter')(processingSchedules.content, {
                            id: $stateParams.processingSchedule
                        })[0];
                    }
                },
                processingPeriods: function(periodService, selectedProcessingSchedule) {
                    if (selectedProcessingSchedule) {
                        return periodService.query({
                            processingScheduleId: selectedProcessingSchedule.id,
                            size: 9999
                        });
                    }
                },
                selectedProcessingPeriod: function($stateParams, $filter, processingPeriods) {
                    if ($stateParams.processingPeriodId) {
                        return $filter('filter')(processingPeriods.content, {
                            id: $stateParams.processingPeriodId
                        })[0];
                    }
                }
            }
        });
    }
})();
