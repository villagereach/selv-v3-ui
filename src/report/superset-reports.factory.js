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
     * @name report.supersetReports
     *
     * @description
     * This is constant defining available superset reports.
     */
    angular
        .module('report')
        .factory('supersetReports', supersetReports);

    function supersetReports() {
        var reports = {};
        reports = {

            AVIAMENTOS: createReport('aviamentos',
                'https://app.powerbi.com/view?r=eyJrIjoiNWQyZWVmNTgtMTRlNy00ZWJkLWE3ZWQtNmY3NmR' +
                'hNjBmY2ZlIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                ''),
            STOCK: createReport('stock',
                'https://app.powerbi.com/view?r=eyJrIjoiYWFjNDNmZmQtZjhmZi00Nzg0LThmMTEtNWRmMjM' +
                '5MjNiMGFkIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                ''),
            COVID: createReport('covid',
                'https://app.powerbi.com/view?r=eyJrIjoiZDUwNDk5OGUtODQwYy00N2NhLTk0M2QtOTgxMzV' +
                'lZDY0YzFjIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9&' +
                'pageName=ReportSectiond6a5b92e4f3af6752354',
                ''),
            VISAO_GERAL: createReport('visaoGeral',
                'https://app.powerbi.com/view?r=eyJrIjoiYjY0MzA5ZjUtMDllZC00MTBmLTk5NTUtYTAxMjE0N' +
                'GRlZmFiIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                ''),
            QUALIDADE_DADOS: createReport('qualidadeDados',
                'https://app.powerbi.com/view?r=eyJrIjoiMDg4MjllYzUtMzUzNi00ODFiLTgyNWUtMWQzODU5N' +
                'TIzNjQ4IiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '')
        };

        return {
            getReports: getReports,
            addReporingPages: addReporingPages
        };

        function addReporingPages($stateProvider) {
            if (angular.equals(reports, {})) {
                // nothing to do here
                return;
            }

            $stateProvider.state('openlmis.reports.list.superset', {
                abstract: true,
                url: '/superset',
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
        }

        function addReporingPage($stateProvider, report) {
            $stateProvider.state('openlmis.reports.list.superset.' + report.code, {
                url: '/' + report.code,
                label: 'report.superset.' + report.code,
                controller: 'SupersetReportController',
                templateUrl: 'report/superset-report.html',
                controllerAs: 'vm',
                resolve: {
                    reportUrl: function($sce) {
                        return $sce.trustAsResourceUrl(report.url);
                    },
                    reportCode: function() {
                        return report.code;
                    }
                }
            });
        }

        function getReports() {
            return reports;
        }

        function createReport(code, url, right) {

            return {
                code: code,
                url: url,
                right: right
            };
        }

    }

})();
