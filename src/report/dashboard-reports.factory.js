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
     * @ngdoc object
     * @name report.dashboardReports
     *
     * @description
     * This is constant defining available dashbaord reports.
     */
    angular
        .module('report')
        .factory('dashboardReports', dashboardReports);

    dashboardReports.$inject = ['reportDashboardService', 'REPORT_TYPES'];

    function dashboardReports(reportDashboardService, REPORT_TYPES) {
        var reports = undefined;

        return {
            getReports: getReports,
            addReporingPages: addReporingPages
        };

        function addReporingPages($stateProvider) {
            reportDashboardService.getAllForUser().then(function(response) {
                reports = response.content;
                if (angular.equals(reports, {})) {
                    // nothing to do here
                    return;
                }

                $stateProvider.state('openlmis.reports.list.dashboard', {
                    abstract: true,
                    url: '/dashboard',
                    views: {
                        // we need the main page to flex to the window size
                        '@': {
                            templateUrl: 'openlmis-main-state/flex-page.html'
                        }
                    }
                });

                Object.values(reports).forEach(function(report) {
                    addReporingPage($stateProvider, report);
                });
            });
        }

        function addReporingPage($stateProvider, report) {
            $stateProvider.state('openlmis.reports.list.dashboard.' + report.id, {
                url: '/' + report.id,
                label: report.name,
                controller: 'DashboardReportController',
                templateUrl: 'report/dashboard-report.html',
                controllerAs: 'vm',
                resolve: createResolve(report)
            });
        }

        function getReports() {
            return reportDashboardService.getAllForUser().then(function(response) {
                return response.content;
            });
        }

        function createResolve(report) {
            var resolve = {
                reportUrl: function($sce) {
                    if (report.type === REPORT_TYPES.SUPERSET) {
                        return $sce.trustAsResourceUrl(report.url + '?standalone=true');
                    }
                    return $sce.trustAsResourceUrl(report.url);
                },
                reportName: function() {
                    return report.name;
                },
                isSupersetReport: function() {
                    return report.type === REPORT_TYPES.SUPERSET;
                }
            };
            if (report.type === REPORT_TYPES.SUPERSET) {
                resolve['authorizationInSuperset'] = authorizeInSuperset;
            }
            return resolve;
        }

        function authorizeInSuperset(loadingModalService, openlmisModalService, $q, $state, MODAL_CANCELLED) {
            loadingModalService.close();
            var dialog = openlmisModalService.createDialog({
                backdrop: 'static',
                keyboard: false,
                controller: 'SupersetOAuthLoginController',
                controllerAs: 'vm',
                templateUrl: 'openlmis-superset/superset-oauth-login.html',
                show: true
            });
            return dialog.promise
                .catch(function(reason) {
                    if (reason === MODAL_CANCELLED) {
                        $state.go('openlmis.reports.list');
                        return $q.resolve();
                    }
                    return $q.reject();
                });
        }
    }

})();
