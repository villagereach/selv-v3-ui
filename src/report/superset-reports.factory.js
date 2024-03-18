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
        // SELV-695: Modify reports page
        reports = {

            DESEMPENHO_E_QUALIDADE_DE_DADOS: createReport(
                'desempenhoEQualidadeDeDados',
                'https://app.powerbi.com/view?r=eyJrIjoiN2Q0MmNlMDEtZDc0My00YTAxLTg3YWItNjJkZm' +
                'IwOTk5Y2FjIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'requisition'
            ),
            REPORTE_DPV_E_AL: createReport(
                'dpvEAl',
                'https://app.powerbi.com/view?r=eyJrIjoiOTM2NzA0NjMtOGE3MC00MDUwLWFkYWQtYjMwZjc2OTQyNTFhIiwidCI6IjAw' +
                'NTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9&pageName=ReportSection06d666f11fa1b443cc66',
                '',
                'requisition'
            ),
            ENTREGA_INTEGRAL: createReport(
                'entregaIntegral',
                'https://app.powerbi.com/view?r=eyJrIjoiNTRmMTEzN2QtYjg1NS00MWMyLWE1YTMtMDYwOWE4' +
                'ZjhkYzliIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'requisition'
            ),
            CONSUMO: createReport(
                'consumo',
                'https://app.powerbi.com/view?r=eyJrIjoiODljNDAwZWYtZjAwYS00MDNhLWI1YzMtOGViODcxZm' +
                'Y1ZGNkIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'requisition'
            ),
            ENTRADAS: createReport(
                'entradas',
                'https://app.powerbi.com/view?r=eyJrIjoiN2U4M2Y4MGEtOTNjYS00NThlLWEzOGQtNGQ1Mzc2N2Vi' +
                'NDQ0IiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'shipment'
            ),
            SAIDAS: createReport(
                'saidas',
                'https://app.powerbi.com/view?r=eyJrIjoiYWU4MzMyMmYtNTc3NC00YmJjLWI5NTgtMWE1MjVmZWFhN' +
                'DBjIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'shipment'
            ),
            DESPERICIOS_E_AJUSTES: createReport(
                'despericiosEAjustes',
                'https://app.powerbi.com/view?r=eyJrIjoiY2IyMDViZmUtNzRmNS00Y2E3LThmMjQtMDNjMzYzNzdjM2R' +
                'lIiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'stock'
            ),
            DATAS_DE_EXPIRACAO: createReport(
                'datasDeExpiracao',
                'https://app.powerbi.com/view?r=eyJrIjoiN2QyODI5NTUtZDIxMS00YzAzLWE2ZmYtNDBhZmI1YTQwNjE0' +
                'IiwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'stock'
            ),
            MOVIMENTOS: createReport(
                'movimentos',
                'https://app.powerbi.com/view?r=eyJrIjoiYzI4ZTNlNTctZWVlNy00ZDU4LWE1MDAtOTkwOTM0YjM4YzcwI' +
                'iwidCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'stock'
            ),
            STOCK_FISICO: createReport(
                'stockFisico',
                'https://app.powerbi.com/view?r=eyJrIjoiZjlhMTU5YjEtZjU5OS00ZmY0LWJjODQtYzBlNGJjZjcxMjJiIiw' +
                'idCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'stock'
            ),
            DISPONIBILDADE_DE_STOCK: createReport(
                'disponibilidadeDeStock',
                'https://app.powerbi.com/view?r=eyJrIjoiYWJkZTNhNjUtZDVlMC00OWEzLTlhMzAtMzQ2OTgzM2YwYzFjIiw' +
                'idCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'stock'
            ),
            DASBOARD_CCE: createReport(
                'dasboardCce',
                'https://app.powerbi.com/view?r=eyJrIjoiZGU0ZDU5OGUtZDU2MS00MmNhLTk0NTItOTM1ODMyNGM5NWE5Iiwi' +
                'dCI6IjAwNTMxNzRhLTkxMDAtNGU4ZS05NzlhLTQ0MzZkYTAxYjBlZSIsImMiOjZ9',
                '',
                'cce'
            )
        };
        // SELV-695: Ends here
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
        // SELV-695: Modify reports page
        function createReport(code, url, right, category) {

            return {
                code: code,
                url: url,
                right: right,
                category: category
            };
        }
        // SELV-695: Ends here

    }

})();
