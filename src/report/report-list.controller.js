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
     * @name report.controller:ReportListController
     *
     * @description
     * Controller for report list view page.
     */
    angular
        .module('report')
        .controller('ReportListController', controller);

    controller.$inject = ['$state', 'reports', 'supersetReports', 'permissions', 'REPORT_RIGHTS'];

    function controller($state, reports, supersetReports, permissions,
                        REPORT_RIGHTS) {
        var vm = this;

        vm.hasRight = hasRight;

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name reports
         * @type {Array}
         *
         * @description
         * The list of all available reports.
         */
        vm.reports = reports;

        // SELV-695: Modify reports page
        var stockReports = {
            jasper: getJasperReports('STOCK'),
            superSet: getSuperSetReports('STOCK')
        };
        var requisitionReports = {
            jasper: getJasperReports('REQUISITION'),
            superSet: getSuperSetReports('REQUISITION')
        };
        var shipmentReports = {
            jasper: getJasperReports('SHIPMENT'),
            superSet: getSuperSetReports('SHIPMENT')
        };
        var administrationReports = {
            jasper: getJasperReports('ADMINISTRATION'),
            superSet: getSuperSetReports('ADMINISTRATION')
        };
        var CCEReports = {
            jasper: getJasperReports('CCE'),
            superSet: getSuperSetReports('CCE')
        };

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name stockReports
         * @type {Array}
         *
         * @description
         * The list of all available stock reports.
         */
        vm.stockReports = stockReports;

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name requisitionReports
         * @type {Array}
         *
         * @description
         * The list of all available requisition reports.
         */
        vm.requisitionReports = requisitionReports;

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name shipmentReports
         * @type {Array}
         *
         * @description
         * The list of all available order reports.
         */
        vm.shipmentReports = shipmentReports;

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name administrationReports
         * @type {Array}
         *
         * @description
         * The list of all available administration reports.
         */
        vm.administrationReports = administrationReports;

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name CCEReports
         * @type {Array}
         *
         * @description
         * The list of all available dashboard reports.
         */
        vm.CCEReports = CCEReports;
        // SELV-695: Ends here

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name supersetReports
         * @type {Object}
         *
         * @description
         * Contains information about available superset reports.
         */
        vm.supersetReports = supersetReports.getReports();

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportListController
         * @name permissions
         * @type {Object}
         *
         * @description
         * Contains information about user report rights.
         */
        vm.permissions = permissions;

        /**
         * @ngdoc method
         * @methodOf report.controller:ReportListController
         * @name hasRight
         *
         * @description
         * Returns true if user has right to manage the proper report.
         *
         * @param {String}   rightName  the right name
         * @return {Boolean}            true if the user has the right, otherwise false
         */
        function hasRight(rightName) {
            return vm.permissions[rightName] || vm.permissions[REPORT_RIGHTS.REPORTS_VIEW];
        }

        // ANGOLASUP-797: Catalogue and organize reports
        function getJasperReports(category) {
            console.log(category);
            return reports.filter(function(report) {
                console.log(report);
                return report.category === category;
            });
        }

        function getSuperSetReports(category) {
            var superSetReportsArray = vm.supersetReports ? Object.values(vm.supersetReports) : [];
            return superSetReportsArray.filter(function(report) {
                return report.category === category;
            });
        }
        // ANGOLASUP-797: Ends here
    }
})();
