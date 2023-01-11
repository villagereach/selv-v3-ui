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
        .module('dhis2')
        .config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {
        var showRequisitionLessOrder = '@@SHOW_REQUISITION_LESS_ORDER' !== 'false';

        $stateProvider.state('openlmis.administration.dhis2', {
            url: '/dhis2',
            label: 'dhis2.label',
            isOffline: false,
            priority: 11,
            showInNavigation: showRequisitionLessOrder,
            views: {
                '@': {
                    templateUrl: 'dhis2/dhis2.html'
                }
            },
            accessRights: [ADMINISTRATION_RIGHTS.ORDER_CREATE]
        });
    }
})();
