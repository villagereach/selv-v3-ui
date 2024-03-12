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
     * @module report
     *
     * @description
     * Provides report pages, which allow generating Jasper reports from services.
     * Report pages allow choosing parameter values from dynamically generated inputs.
     */
    angular.module('report', [
        'ngResource',
        'openlmis-i18n',
        'openlmis-rights',
        'openlmis-table',
        'openlmis-urls',
        'openlmis-permissions',
        'openlmis-main-state',
        'ui.router',
        // SELVSUP-6: Create Stock on Hand Report on reports page
        'ngTagsInput'
        // SELVSUP-6: Ends here
    ]);

})();