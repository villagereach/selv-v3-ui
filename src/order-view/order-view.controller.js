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

    /**
     * @ngdoc controller
     * @name order-view.controller:OrderViewController
     *
     * @description
     * Responsible for managing Order View. Exposes facilities/programs to populate selects and
     * fetches data to populate grid.
     */
    angular
        .module('order-view')
        .controller('OrderViewController', controller);

    controller.$inject = [
        'supplyingFacilities', 'requestingFacilities', 'programs', 'requestingFacilityFactory',
        'loadingModalService', 'notificationService', 'fulfillmentUrlFactory', 'orders',
        'orderService', 'orderStatusFactory', 'canRetryTransfer', '$stateParams', '$filter', '$state', '$scope',
        'accessTokenFactory', 'openlmisUrlFactory', 'proofOfDeliveryManageService', '$window', 'ORDER_STATUSES',
        'processingSchedules', 'selectedProcessingSchedule', 'periodService', 'processingPeriods',
        'selectedProcessingPeriod'
    ];

    function controller(supplyingFacilities, requestingFacilities, programs, requestingFacilityFactory,
                        loadingModalService, notificationService, fulfillmentUrlFactory, orders, orderService,
                        orderStatusFactory, canRetryTransfer, $stateParams, $filter, $state, $scope,
                        accessTokenFactory, openlmisUrlFactory, proofOfDeliveryManageService, $window, ORDER_STATUSES,
                        processingSchedules, selectedProcessingSchedule, periodService, processingPeriods,
                        selectedProcessingPeriod) {

        var vm = this;

        vm.$onInit = onInit;
        vm.loadOrders = loadOrders;
        vm.printOrder = printOrder;
        vm.getDownloadUrl = getDownloadUrl;
        vm.retryTransfer = retryTransfer;
        vm.redirectToOrderEdit = redirectToOrderEdit;
        // SELV3-229: Translate Requisition and Order Status
        vm.getOrderStatus = ORDER_STATUSES.getStatusMessage;
        // SELV3-229: Ends here

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name supplyingFacilities
         * @type {Array}
         *
         * @description
         * The list of all supplying facilities available to the user.
         */
        vm.supplyingFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name requestingFacilities
         * @type {Array}
         *
         * @description
         * The list of requesting facilities available to the user.
         */
        vm.requestingFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name periodStartDate
         * @type {Object}
         *
         * @description
         * The beginning of the period to search for orders.
         */
        vm.periodStartDate = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name periodEndDate
         * @type {Object}
         *
         * @description
         * The end of the period to search for orders.
         */
        vm.periodEndDate = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name programs
         * @type {Array}
         *
         * @description
         * The list of all programs available to the user.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name orders
         * @type {Array}
         *
         * @description
         * Holds orders that will be displayed on screen.
         */
        vm.orders = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name canRetryTransfer
         * @type {Boolean}
         *
         * @description
         * Becomes true if user has permission to retry transfer of failed order.
         */
        vm.canRetryTransfer = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name orderStatuses
         * @type {Array}
         *
         * @description
         * Contains a list of possible order statuses to allow filtering.
         */
        vm.orderStatuses = undefined;

        /**
         * @ngdoc method
         * @methodOf order-view.controller:OrderViewController
         * @name $onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name processingSchedules
         * @type {Array}
         *
         * @description
         * List of processing schedules to which user has access based on his role/permissions.
         */
        vm.processingSchedules = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name selectedProcessingSchedule
         * @type {Object}
         *
         * @description
         * The processing schedule selected by the user.
         */
        vm.selectedProcessingSchedule = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name processingPeriods
         * @type {Array}
         *
         * @description
         * List of processing periods to which user has access based on his role/permissions.
         */
        vm.processingPeriods = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-approval.controller:RequisitionApprovalListController
         * @name selectedProcessingPeriod
         * @type {Object}
         *
         * @description
         * The processing period selected by the user.
         */
        vm.selectedProcessingPeriod = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-view.controller:OrderViewController
         * @name sortOptions
         * @type {Object}
         * 
         * @description
         * Contains a list of possible sort options to allow sorting.
         */
        vm.sortOptions = {
            'orderView.newestFirst': ['createdDate,desc'],
            'orderView.oldestFirst': ['createdDate,asc']
        };

        function onInit() {
            vm.supplyingFacilities = supplyingFacilities;
            vm.requestingFacilities = requestingFacilities;
            vm.canRetryTransfer = canRetryTransfer;
            vm.programs = programs;
            vm.orderStatuses = orderStatusFactory.getAll();

            vm.orders = orders;

            if ($stateParams.supplyingFacilityId) {
                vm.supplyingFacility = $filter('filter')(vm.supplyingFacilities, {
                    id: $stateParams.supplyingFacilityId
                })[0];
            }

            if ($stateParams.requestingFacilityId) {
                vm.requestingFacility = $filter('filter')(vm.requestingFacilities, {
                    id: $stateParams.requestingFacilityId
                })[0];
            }

            if ($stateParams.programId) {
                vm.program = $filter('filter')(vm.programs, {
                    id: $stateParams.programId
                })[0];
            }

            if ($stateParams.periodStartDate) {
                vm.periodStartDate = $stateParams.periodStartDate;

            }

            if ($stateParams.periodEndDate) {
                vm.periodEndDate = $stateParams.periodEndDate;
            }

            if ($stateParams.status) {
                vm.status = vm.orderStatuses.filter(function(status) {
                    return $stateParams.status === status.value;
                })[0];
            }

            vm.processingSchedules = processingSchedules;
            vm.selectedProcessingSchedule = selectedProcessingSchedule;
            vm.processingPeriods = processingPeriods;
            vm.selectedProcessingPeriod = selectedProcessingPeriod;

            $scope.$watch('vm.selectedProcessingSchedule', function() {
                fetchProcessingPeriods();
            });

            $scope.$watch(function() {
                return vm.supplyingFacility;
            }, function(newValue, oldValue) {
                if (newValue && hasSupplyingFacilityChange(newValue, oldValue)) {
                    loadRequestingFacilities(vm.supplyingFacility.id);
                }
                if (!newValue) {
                    vm.requestingFacilities = undefined;
                }
            }, true);
        }

        /**
         * @ngdoc method
         * @methodOf order-view.controller:OrderViewController
         * @name loadOrders
         *
         * @description
         * Retrieves the list of orders matching the selected supplying facility, requesting
         * facility and program.
         *
         * @return {Array} the list of matching orders
         */
        function loadOrders() {
            var stateParams = angular.copy($stateParams);

            stateParams.supplyingFacilityId = vm.supplyingFacility ? vm.supplyingFacility.id : null;
            stateParams.requestingFacilityId = vm.requestingFacility ? vm.requestingFacility.id : null;
            stateParams.programId = vm.program ? vm.program.id : null;
            stateParams.status = vm.status ? vm.status.value : null;
            stateParams.periodStartDate = vm.periodStartDate ? $filter('isoDate')(vm.periodStartDate) : null;
            stateParams.periodEndDate = vm.periodEndDate ? $filter('isoDate')(vm.periodEndDate) : null;
            stateParams.processingSchedule = vm.selectedProcessingSchedule ? vm.selectedProcessingSchedule.id : null;
            stateParams.processingPeriodId = vm.selectedProcessingPeriod ? vm.selectedProcessingPeriod.id : null;
            stateParams.sort = 'createdDate,desc';

            $state.go('openlmis.orders.view', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf order-view.controller:OrderViewController
         * @name printOrder
         *
         * @description
         * Prepares a print URL for the given order.
         *
         * @param  {Object} order the order to prepare the URL for
         * @return {String}       the prepared URL
         */
        function printOrder(order) {
            loadingModalService.open();
            var popup = $window.open('', '_blank');
            popup.location.href = accessTokenFactory.addAccessToken(getPrintUrl(order.id));
            loadingModalService.close();
        }

        function getPrintUrl(orderId) {
            return openlmisUrlFactory('/api/reports/templates/common/a32c5b59-a102-46c4-9ecc-2b56d985a12c/pdf?orderId='
            + orderId);
        }

        /**
         * @ngdoc method
         * @methodOf order-view.controller:OrderViewController
         * @name getDownloadUrl
         *
         * @description
         * Prepares a download URL for the given order.
         *
         * @param  {Object} order the order to prepare the URL for
         * @return {String}       the prepared URL
         */
        function getDownloadUrl(order) {
            return fulfillmentUrlFactory('/api/orders/' + order.id + '/export?type=csv');
        }

        /**
         * @ngdoc method
         * @methodOf order-view.controller:OrderViewController
         * @name retryTransfer
         *
         * @description
         * For an order that failed to transfer correctly, retry the transfer of order file.
         *
         * @param  {Object} order the order to retry the transfer for
         */
        function retryTransfer(order) {
            loadingModalService.open();
            orderService.retryTransfer(order.id).then(function(response) {
                if (response.result) {
                    notificationService.success('orderView.transferComplete');
                    $state.reload();
                } else {
                    notificationService.error('orderView.transferFailed');
                }
            })
                .catch(function(error) {
                    notificationService.error(error.description);
                })
                .finally(loadingModalService.close);
        }

        function loadRequestingFacilities(supplyingFacilityId) {
            loadingModalService.open();
            requestingFacilityFactory.loadRequestingFacilities(supplyingFacilityId).then(function(facilities) {
                vm.requestingFacilities = facilities;
            })
                .finally(loadingModalService.close);
        }

        function hasSupplyingFacilityChange(newValue, oldValue) {
            return newValue.id !== $stateParams.supplyingFacilityId
                || (newValue.id === $stateParams.supplyingFacilityId &&
                    oldValue && oldValue.id !== $stateParams.supplyingFacilityId);
        }

        /**
         * @ngdoc method
         * @methodOf order-view.controller:OrderViewController
         * @name redirectToOrderEdit
         *
         * @description
         * Redirects to page with order edit
         *
         * @param  {String} orderId
         */
        function redirectToOrderEdit(orderId) {
            $state.go(
                'openlmis.requisitions.orderCreate.table',
                {
                    orderId: orderId
                }
            );
        }

        function fetchProcessingPeriods() {
            if (vm.selectedProcessingSchedule && processingPeriods === undefined) {
                periodService.query({
                    processingScheduleId: vm.selectedProcessingSchedule.id,
                    size: 9999
                }).then(function(fetchedData) {
                    vm.processingPeriods = fetchedData;
                });
            }
        }
    }

})();
