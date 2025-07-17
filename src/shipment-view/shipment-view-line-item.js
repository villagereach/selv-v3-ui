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
     * @name shipment-view.ShipmentViewLineItem
     *
     * @description
     * Represents a single shipment view line item. It can represent either a single lot or a
     * generic orderable.
     */
    angular
        .module('shipment-view')
        .factory('ShipmentViewLineItem', ShipmentViewLineItem);

    function ShipmentViewLineItem() {

        ShipmentViewLineItem.prototype.getAvailableSoh = getAvailableSoh;
        ShipmentViewLineItem.prototype.getFillQuantity = getFillQuantity;
        ShipmentViewLineItem.prototype.getRemainingSoh = getRemainingSoh;
        ShipmentViewLineItem.prototype.recalculateQuantity = recalculateQuantity;
        ShipmentViewLineItem.prototype.getOrderQuantity = getOrderQuantity;

        return ShipmentViewLineItem;

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name ShipmentViewLineItem
         * @constructor
         *
         * @description
         * Creates an instance of the ShipmentViewLineItem.
         *
         * @param {Object} config configuration object used when creating new instance of the class
         */
        function ShipmentViewLineItem(config) {
            this.productCode = config.productCode;
            this.productName = config.productName;
            this.lot = config.lot;
            this.vvmStatus = config.vvmStatus;
            this.shipmentLineItem = config.shipmentLineItem;
            this.netContent = config.netContent;
            this.isLot = true;
            this.orderQuantity = config.orderQuantity;
            this.packRoundingThreshold = config.packRoundingThreshold;
            this.roundToZero = config.roundToZero;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name getAvailableSoh
         *
         * @description
         * Returns available stock on hand for the commodity type or lot.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the available stock on hand for the specific commodity type or
         *                           lot
         */
        function getAvailableSoh(inDoses) {
            return this.recalculateQuantity(this.shipmentLineItem.stockOnHand, inDoses);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name getFillQuantity
         *
         * @description
         * Returns available stock on hand for the commodity type or lot.
         *
         * @return {number} the fill quantity for the specific commodity type or lot
         */
        function getFillQuantity(inDoses) {
            // SELVSUP-14: Recalculate input quantity to doses
            if (inDoses) {
                return this.shipmentLineItem.quantityShippedInDoses || 0;
            }
            // SELVSUP-14: ends here
            return this.shipmentLineItem.quantityShipped || 0;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name getRemainingSoh
         *
         * @description
         * Returns the remaining stock after fulfilling the order for a specific commodity type or
         * lot
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the remaining stock after fulfilling the order for a specific
         *                           commodity type or lot
         */
        function getRemainingSoh(inDoses) {
            var remainingQuantityInPacks = this.getAvailableSoh() - this.getFillQuantity();

            return this.recalculateQuantity(remainingQuantityInPacks, inDoses);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name getOrderQuantity
         *
         * @description
         * Returns an ordered quantity for the commodity type related with the line item.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the ordered quantity for the commodity type related with the
         *                           line item
         */
        function getOrderQuantity(inDoses) {
            if (this.orderQuantity === undefined || this.orderQuantity === null) {
                return;
            }
            return this.recalculateQuantity(this.orderQuantity, inDoses);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name recalculateQuantity
         *
         * @description
         * Recalculates the given quantity in packs (if the flag is set) taking the net content into
         * consideration.
         *
         * @param  {number}  quantity the quantity to be recalculated
         * @param  {boolean} inDoses  flag defining whether the returned value should be returned in
         *                            doses or in packs
         * @return {number}           the ordered quantity for the commodity type related with the
         *                            line item
         */
        function recalculateQuantity(quantity, inDoses) {
            if (inDoses) {
                return quantity * this.netContent;
            }
            return quantity;
        }
    }

})();