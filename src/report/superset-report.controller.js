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
     * @name report.controller:SupersetReportController
     *
     * @description
     * Controller for superset report view.
     */
    angular
        .module('report')
        .controller('SupersetReportController', SupersetReportController);

    SupersetReportController.inject = ['reportCode', 'reportUrl', 'loadingModalService', 'messageService',
        'supersetLocaleService', 'SUPERSET_URL'];

    function SupersetReportController(reportCode, reportUrl, loadingModalService, messageService,
                                      supersetLocaleService, SUPERSET_URL) {
        var vm = this;
        vm.$onInit = onInit;

        /**
         * @ngdoc property
         * @propertyOf report.controller:SupersetReportController
         * @name reportCode
         * @type {string}
         *
         * @description
         * The superset report code.
         */
        vm.reportCode = undefined;

        /**
         * @ngdoc property
         * @propertyOf report.controller:SupersetReportController
         * @name reportUrl
         * @type {string}
         *
         * @description
         * The superset report URL.
         */
        vm.reportUrl = undefined;

        /**
         * @ngdoc property
         * @propertyOf report.controller:SupersetReportController
         * @name authUrl
         * @type {string}
         *
         * @description
         * The superset authorization URL.
         */
        vm.authUrl = undefined;

        /**
         * @ngdoc property
         * @propertyOf report.controller:SupersetReportController
         * @name isReady
         * @type {boolean}
         *
         * @description
         * Indicates if the controller is ready for displaying the Superset iframe.
         */
        vm.isReady = false;

        function onInit() {
            vm.reportCode = reportCode;
            vm.reportUrl = reportUrl;
            vm.authUrl = SUPERSET_URL + '/login/openlmis';

            adjustSupersetLanguage();
        }

        function adjustSupersetLanguage() {
            loadingModalService.open();

            var locale = messageService.getCurrentLocale();
            supersetLocaleService.changeLocale(locale)
                .then(function() {
                    vm.isReady = true;
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }
    }

})();
