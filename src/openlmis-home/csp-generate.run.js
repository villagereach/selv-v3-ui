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
        .module('openlmis-home')
        .run(run);

    run.$inject = [];

    function run() {

        function getCSPTag() {
            var GOOGLE_ANALYTICS_URL = 'www.google-analytics.com';
            var SUPERSET_URL = '${SUPERSET_URL}';
            var IMAGE_URL = 'data:';
            if (SUPERSET_URL.substr(0, 2) === '${') {
                SUPERSET_URL = '';
            }

            var cspHeader = 'default-src \'self\' ' + SUPERSET_URL + ' \'unsafe-inline\';\n' +
                'img-src \'self\' ' + IMAGE_URL + ' ' + GOOGLE_ANALYTICS_URL + ';\n' +
                'script-src \'self\' ' + GOOGLE_ANALYTICS_URL + ' \'unsafe-inline\' \'unsafe-eval\';\n' +
                'connect-src \'self\' ' + GOOGLE_ANALYTICS_URL + ' ' + SUPERSET_URL + ';\n' +
                'frame-src \'self\' ' + SUPERSET_URL + ';';

            return cspHeader;
        }

        function addCSPTag() {
            var cspContent = getCSPTag();
            var metaTag = document.createElement('meta');
            metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
            metaTag.setAttribute('content', cspContent);
            document.head.appendChild(metaTag);
        }
        addCSPTag();
    }

})();
