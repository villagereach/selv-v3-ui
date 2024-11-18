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
        .module('openlmis-home-alerts-panel')
        .controller('openlmisHomeAlertsPanelController', controller);

    controller.$inject = ['openlmisHomeAlertsPanelService'];

    function controller(openlmisHomeAlertsPanelService) {
        var $ctrl = this;
        $ctrl.requisitionsStatusesStats = undefined;
        $ctrl.ordersStatusesStats = undefined;
        $ctrl.requisitionsToBeCreated = undefined;
        var requisitionsImportantData = ['SUBMITTED', 'AUTHORIZED', 'IN_APPROVAL'];
        var ordersImportantData = ['ORDERED', 'FULFILLING', 'SHIPPED', 'IN_ROUTE'];
        var REQUISITION_PREFIX = 'requisition';
        var ORDERS_PREFIX = 'orders';

        $ctrl.$onInit = onInit;

        function onInit() {
            openlmisHomeAlertsPanelService.getRequisitionsStatusesData()
                .then(function(requisitionsData) {
                    $ctrl.requisitionsStatusesStats =
                        openlmisHomeAlertsPanelService.
                            getMappedStatussesStats(
                                REQUISITION_PREFIX,
                                requisitionsData.statusesStats,
                                requisitionsImportantData
                            );

                    $ctrl.requisitionsToBeCreated = requisitionsData.requisitionsToBeCreated;
                });

            openlmisHomeAlertsPanelService.getOrdersStatusesData()
                .then(function(ordersData) {
                    $ctrl.ordersStatusesStats =
                        openlmisHomeAlertsPanelService.
                            getMappedStatussesStats(ORDERS_PREFIX, ordersData.statusesStats, ordersImportantData);
                });
        }
    }
})();
