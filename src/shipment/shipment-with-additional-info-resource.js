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
     * @name shipment.ShipmentWithAdditionalInfoResource
     *
     * @description
     * Communicates with the SELV extension endpoint that creates a shipment together with the
     * additional shipment fields (validated server-side). Used in place of the core shipment
     * resource for the confirm-shipment POST so the extra fields are validated and persisted in
     * a single request.
     */
    angular
        .module('shipment')
        .factory('ShipmentWithAdditionalInfoResource', ShipmentWithAdditionalInfoResource);

    ShipmentWithAdditionalInfoResource.$inject = ['OpenlmisResource', 'classExtender'];

    function ShipmentWithAdditionalInfoResource(OpenlmisResource, classExtender) {

        classExtender.extend(ShipmentWithAdditionalInfoResource, OpenlmisResource);

        return ShipmentWithAdditionalInfoResource;

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentWithAdditionalInfoResource
         * @name ShipmentWithAdditionalInfoResource
         * @constructor
         *
         * @description
         * Creates an instance of the ShipmentWithAdditionalInfoResource class pointing at the
         * additional-shipment-info extension endpoint. The endpoint returns a single shipment
         * (not a page), hence paginated:false.
         */
        function ShipmentWithAdditionalInfoResource() {
            this.super('/api/extension/shipments/withAdditionalInfo', {
                paginated: false
            });
        }

    }

})();
