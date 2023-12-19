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
     * @module admin-requisition-group-add
     *
     * @description
     * Provides base admin requisition group state and controller for creating new requisition groups.
     */
    angular.module('admin-requisition-group-edit', [
        'referencedata-facility',
        'openlmis-pagination',
        'openlmis-rights',
        'openlmis-object-utils',
        'referencedata-requisition-group',
        'referencedata-program',
        'referencedata-geographic-zone',
        'ui.router'
    ]);

})();
