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
     * @ngdoc service
     * @name report:supersetLocaleService
     * @description
     * The service that allows modifing Superset locales.
     */
    angular
        .module('report')
        .service('supersetLocaleService', supersetLocaleService);

    supersetLocaleService.$inject = ['SUPERSET_URL', 'SUPERSET_LOCALES', 'DEFAULT_LANGUAGE', '$http'];

    function supersetLocaleService(SUPERSET_URL, SUPERSET_LOCALES, DEFAULT_LANGUAGE, $http) {

        this.changeLocale = changeLocale;

        /**
         * @ngdoc method
         * @methodOf report:supersetLocaleService
         * @name changeLocale
         *
         * @description
         * The method that changes Superset locales.
         *
         * @param  {String}  locale (optional) locale to populate
         * @return {Promise}        The promise of Superset locale change request.
         */
        function changeLocale(locale) {
            return $http({
                method: 'GET',
                url: SUPERSET_URL + '/lang/change/' + getValidLocale(locale),
                withCredentials: true
            });
        }

        function getValidLocale(locale) {
            if (SUPERSET_LOCALES.indexOf(locale) === -1) {
                locale = DEFAULT_LANGUAGE;
            }
            return locale;
        }
    }
}());
