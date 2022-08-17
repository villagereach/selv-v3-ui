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
     * @name shipment-view.controller:ShipmentViewController
     *
     * @description
     * Responsible for managing shipment view screen.
     */
    angular
        .module('shipment-view')
        .controller('ShipmentViewController', ShipmentViewController);

    ShipmentViewController.$inject = [
        'shipment', 'loadingModalService', '$state', '$window', 'fulfillmentUrlFactory',
        'messageService', 'accessTokenFactory', 'updatedOrder', 'QUANTITY_UNIT', 'tableLineItems',
        'VVM_STATUS', 'confirmService', 'drafts', 'shipmentViewService'
    ];

    function ShipmentViewController(shipment, loadingModalService, $state, $window,
                                    fulfillmentUrlFactory, messageService, accessTokenFactory,
                                    updatedOrder, QUANTITY_UNIT, tableLineItems, VVM_STATUS,
                                    confirmService, drafts, shipmentViewService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;
        vm.getMessageInQuantityUnitKey = getMessageInQuantityUnitKey;
        vm.getVvmStatusLabel = VVM_STATUS.$getDisplayName;
        vm.printShipment = printShipment;
        vm.confirmShipment = confirmShipment;
        // SELV3-507: Allow user to enter Shipment Date
        vm.drafts = drafts;
        // SELV3-507: ends here

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name order
         * @type {Object}
         *
         * @description
         * Holds order that will be displayed on the screen.
         */
        vm.order = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name shipment
         * @type {Object}
         *
         * @description
         * Holds shipment that will be displayed on the screen.
         */
        vm.shipment = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name tableLineItems
         * @type {Array}
         *
         * @description
         * Holds line items to be displayed on the grid.
         */
        vm.tableLineItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name quantityUnit
         * @type {Object}
         *
         * @description
         * Holds quantity unit.
         */
        vm.quantityUnit = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name drafts
         * @type {Array}
         *
         * @description
         * Holds drafts crucial to get minimum date for shipment date
         */
        vm.drafts = undefined;

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */
        function onInit() {
            vm.order = updatedOrder;
            vm.shipment = shipment;
            vm.tableLineItems = tableLineItems;
            // SELV3-507: Allow user to enter Shipment Date
            vm.drafts = drafts.flat().filter(function(draft) {
                return !draft.isDraft && !draft.isStarter && draft.programId === vm.order.program.id;
            })
                .sort(function(a, b) {
                    return new Date(b.occurredDate) - new Date(a.occurredDate);
                });
            shipmentViewService.setDrafts(vm.drafts);
            // SELV3-507: ends here
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name showInDoses
         *
         * @description
         * Returns whether the screen is showing quantities in doses.
         *
         * @return {boolean} true if the quantities are in doses, false otherwise
         */
        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name getSelectedQuantityUnitKey
         *
         * @description
         * Returns message key for selected quantity unit.
         */
        function getSelectedQuantityUnitKey() {
            return QUANTITY_UNIT.$getDisplayName(vm.quantityUnit);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name getMessageInQuantityUnitKey
         *
         * @description
         * Returns message key for selected quantity unit.
         */
        function getMessageInQuantityUnitKey() {
            return QUANTITY_UNIT.$getQuantityDisplayName(vm.quantityUnit);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name printShipment
         * 
         * @description
         * Prints the shipment.
         * 
         * @return {Promise} the promise resolved when print is successful, rejected otherwise
         */
        function printShipment() {
            var popup = $window.open('', '_blank');
            popup.document.write(messageService.get('shipmentView.saveDraftPending'));

            return shipment.save()
                .then(function(response) {
                    popup.location.href = accessTokenFactory.addAccessToken(getPrintUrl(response.id));
                });
        }

        function getPrintUrl(shipmentId) {
            return fulfillmentUrlFactory(
                '/api/reports/templates/common/583ccc35-88b7-48a8-9193-6c4857d3ff60/pdf?shipmentDraftId=' + shipmentId
            );
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name printShipment
         * 
         * @description
         * Confirm the shipment.
         * 
         * @return {Promise} the promise resolved when confirmation is successful, rejected otherwise
         */
        function confirmShipment() {
            var sum = checkIfQuantityShipedIsFilled();

            if (sum === 0) {

                confirmService.confirmDestroy(
                    'shipmentView.saveShipmentConfirmation',
                    'shipmentView.yes',
                    'shipmentView.no'
                )
                    .then(function() {
                        shipment.confirm();
                    });
            } else {
                shipment.confirm();
            }
        }

        function checkIfQuantityShipedIsFilled() {
            var array = shipment.lineItems;
            var sum = 0;

            for (var i = 0;i < array.length;i++) {
                sum += array[i].quantityShipped;
            }

            return sum;
        }

    }
})();
