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
     * @name shipment-view.QUANTITY_UNIT
     *
     * @description
     * Contains all possible quanity units.
     */
    angular
        .module('shipment-view')
        .constant('QUANTITY_UNIT', units());

    function units() {
        var values = {
            PACKS: 'PACKS',
            DOSES: 'DOSES',
            $getDisplayName: getDisplayName,
            $getQuantityDisplayName: getQuantityDisplayName
        };
        var displayNames = {
            PACKS: 'shipmentView.packs',
            DOSES: 'shipmentView.doses'
        };
        var quantityDisplayNames = {
            PACKS: 'shipmentView.fillQuantityInPack',
            DOSES: 'shipmentView.fillQuantityInDoses'
        };

        return values;

        function getDisplayName(name) {
            return displayNames[name];
        }

        function getQuantityDisplayName(name) {
            return quantityDisplayNames[name];
        }
    }

})();
