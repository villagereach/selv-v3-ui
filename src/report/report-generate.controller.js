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
     * @name report.controller:ReportGenerateController
     *
     * @description
     * Controller for report options page.
     */
    angular
        .module('report')
        .controller('ReportGenerateController', controller);

    controller.$inject = [
        '$state', '$scope', '$window', 'report', 'reportFactory',
        'reportParamsOptions', 'reportUrlFactory', 'accessTokenFactory',  '$q'
    ];

    function controller($state, $scope, $window, report, reportFactory,
                        reportParamsOptions, reportUrlFactory, accessTokenFactory, $q) {
        var vm = this;

        vm.$onInit = onInit;

        vm.downloadReport = downloadReport;

        vm.paramsInfo = {
            GeographicZone: 'report.geographicZoneInfo',
            DueDays: 'report.dueDaysInfo'
        };

        // SELVSUP-6: Create Stock on Hand Report on reports page
        vm.booleanOptions = [{
            name: 'Yes',
            value: 'true'
        },
        {
            name: 'No',
            value: 'false'
        }];
        // SELVSUP-6: Ends here

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportGenerateController
         * @name report
         * @type {Object}
         *
         * @description
         * The object representing the selected report.
         */
        vm.report = report;

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportGenerateController
         * @name paramsOptions
         * @type {Array}
         *
         * @description
         * The param options for this report, by param. A param can have multiple options, for
         * example a period param, will have all available periods as options. Objects containing
         * 'value' and 'displayName' properties.
         */
        vm.paramsOptions = reportParamsOptions;

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportGenerateController
         * @name selectedParamsOptions
         * @type {Object}
         *
         * @description
         * The collection of selected options by param name.
         */
        vm.selectedParamsOptions = {};

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportGenerateController
         * @name selectedParamsDependencies
         * @type {Object}
         *
         * @description
         * The collection of parameter dependencies and their selected values.
         */
        vm.selectedParamsDependencies = {};

        /**
         * @ngdoc property
         * @propertyOf report.controller:ReportGenerateController
         * @name format
         * @type {String}
         *
         * @description
         * The format selected for the report. Either 'pdf' (default), 'csv', 'xls' or 'html'.
         */
        vm.format = 'pdf';

        // SELVSUP-6: Create Stock on Hand Report on reports page
        /**
         * @ngdoc method
         * @methodOf report.controller:ReportGenerateController
         * @name watchFacilitySelection
         *
         * @description
         * Check whether the user has selected a specific facility, facility type or geographic zone 
         * in the report and block/unlock the appropriate selects.
         */
        function watchFacilitySelection() {
            var relevantSelects = ['facility', 'geographicZone', 'facilityType'];
            $scope.$watch('vm.selectedParamsOptions', function(newVal) {
                var allValuesNull = relevantSelects.every(function(selectName) {
                    return vm.selectedParamsOptions[selectName] === null;
                });

                if (allValuesNull) {
                    angular.element(document.querySelectorAll('select')).removeAttr('disabled');
                } else if (newVal['facility'] && newVal['facility'] !== null) {
                    angular.element(document.querySelector('#geographicZone')).attr('disabled', 'disabled');
                    angular.element(document.querySelector('#facilityType')).attr('disabled', 'disabled');
                    vm.selectedParamsOptions['geographicZone'] = null;
                    vm.selectedParamsOptions['facilityType'] = null;
                } else if ((newVal['geographicZone'] && newVal['geographicZone'] !== null)
                    || (newVal['facilityType'] && newVal['facilityType'] !== null)) {
                    angular.element(document.querySelector('#facility')).attr('disabled', 'disabled');
                    vm.selectedParamsOptions['facility'] = null;
                }
            }, true);
        }
        // SELVSUP-6: Ends here

        /**
         * @ngdoc method
         * @methodOf report.controller:ReportGenerateController
         * @name downloadReport
         *
         * @description
         * Downloads the report. Opens a new tab that redirects to the actual download report
         * url, passing selected param options as well as the selected format.
         */
        function downloadReport() {
            // SELVSUP-6: Create Stock on Hand Report on reports page
            var mappedParameters = vm.mapParameters(vm.selectedParamsOptions);
            // SELVSUP-6: Ends here
            $window.open(
                accessTokenFactory.addAccessToken(
                    reportUrlFactory.buildUrl(
                        vm.report.$module,
                        vm.report,
                        mappedParameters,
                        vm.format
                    )
                ),
                '_blank'
            );
        }

        /**
         * @ngdoc method
         * @methodOf report.controller:ReportGenerateController
         * @name watchDependency
         *
         * @description
         * Sets up a watch on report parameter selection,
         * to update dependent parameters options based on it's value.
         *
         * @param   {Object}    param             the report parameter that needs to watch for
         *                                        dependency.
         * @param   {Object}    dep               the dependency object to set up watch for.
         */
        function watchDependency(param, dep) {
            var watchProperty = 'vm.selectedParamsOptions.' + dep.dependency;
            $scope.$watch(watchProperty, function(newVal) {
                vm.selectedParamsDependencies[dep.dependency] = newVal;
                if (newVal) {
                    reportFactory.getReportParamOptions(param, vm.selectedParamsDependencies)
                        .then(function(items) {
                            vm.paramsOptions[param.name] = items;
                        });
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf report.controller:ReportGenerateController
         * @name $onInit
         *
         * @description
         * Initialization method of the ReportGenerateController.
         */
        function onInit() {
            angular.forEach(report.templateParameters, function(param) {
                angular.forEach(param.dependencies, function(dependency) {
                    watchDependency(param, dependency);
                });
            });
            // SELVSUP-6: Create Stock on Hand Report on reports page
            watchFacilitySelection();
            vm.filterAvailableParameters = filterAvailableParameters;
            vm.mapParameters = mapParameters;
            // SELVSUP-6: Ends here
        }

        // SELVSUP-6: Create Stock on Hand Report on reports page
        function changeCommasToSemicolons(text) {
            if (text === null) {
                return text;
            }
            var reducedText = text.reduce(function(acc, curr) {
                return acc + curr.replace(',', ';;') + ';';
            }, '');
            return reducedText.slice(0, reducedText.length - 1);
        }

        /**
         * @ngdoc method
         * @methodOf report.controller:ReportGenerateController
         * @name mapParameters
         *
         * @description
         * Method changig the types of parameters in order to create an report (which requires concrete types)
         * @param  {Array} parameter the parameter used when filtering tags
         * @return {String} string 
         */
        function mapParameters(parameters) {
            var mappedParameters = Object.assign({}, parameters);
            for (var property in mappedParameters) {
                if ((typeof mappedParameters[property]) === (typeof [])) {
                    mappedParameters[property] = changeCommasToSemicolons(mappedParameters[property]);
                }
            }
            return mappedParameters;
        }

        /**
         * @ngdoc method
         * @methodOf report.controller:ReportGenerateController
         * @name filterAvailableParameters
         *
         * @description
         * Filters the list of available parameters with the given query. Returns a promise 
         * resolving to the filtered list.
         * The reason why this method returns a promise is that it is required by the ngTagsInput.
         *
         * @param  {String} parameter the parameter used when filtering tags
         * @param  {String} query the query used when filtering tags
         * @return {Promise}      the promise resolving to filtered list
         */
        function filterAvailableParameters(parameter, query) {
            if (!vm.paramsOptions[parameter.name]) {
                return $q.resolve([]);
            }

            if (!query) {
                return $q.resolve(vm.paramsOptions[parameter.name]);
            }

            return $q.resolve(Array.from(new Set(vm.paramsOptions[parameter.name].filter(function(parameter) {
                return parameter.name.toLowerCase()
                    .indexOf(query.toLowerCase()) > -1;
            }).map(function(parameter) {
                return parameter.name;
            }))));
        }
        // SELVSUP-6: Ends here
    }
})();
