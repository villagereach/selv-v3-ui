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
     * @name stock-choose-date-modal.controller:ChooseDateModalController
     *
     * @description
     * Manages Choose Date Modal.
     */
    angular
        .module('stock-choose-date-modal')
        .controller('ChooseDateModalController', controller);

    controller.$inject = ['$filter', 'modalDeferred', 'authorizationService', 'minDate', '$location',
        'showPhysicalInventoryWarning'];

    function controller($filter, modalDeferred, authorizationService, minDate, $location,
                        showPhysicalInventoryWarning) {

        var vm = this;
        // SELV3-507: Allow user to enter Shipment Date
        vm.minDate = minDate;
        vm.showPhysicalInventoryWarning = showPhysicalInventoryWarning;
        // SELV3-529: Fix error when submitting physical inventory
        vm.maxDate = $location.absUrl().includes('physicalInventory') ? $filter('isoDate')(new Date()) : new Date();
        // SELV3-529: Ends here
        vm.occurredDate = vm.maxDate;
        vm.shipmentDate = vm.maxDate;
        vm.signature = '';
        vm.username = authorizationService.getUser().username;
        // SELV3-846: Additional shipment fields (all optional)
        vm.volumesCount = '';
        vm.icePacksCount = '';
        vm.packingPerson = '';
        vm.truckRegistration = '';
        vm.trailerRegistration = '';
        vm.securitySeal = '';
        // Field limits mirror the backend validator: counts fit the 9-digit (^[0-9]{1,9}$)
        // non-negative range, free-text fields are capped at 255 characters.
        vm.maxCountLength = 9;
        vm.maxTextLength = 255;

        // Mozambican plate format: three letters, three digits, two-letter province code (e.g. ABC123MP).
        // Keep byte-identical with the BE validator (AdditionalShipmentInfoValidator.TRUCK_REGISTRATION_PATTERN).
        var truckRegistrationPattern = /^[A-Z]{3}[0-9]{3}[A-Z]{2}$/;

        // Placeholder for last-mile delivery where the transport is not a vehicle and no real
        // plate exists; accepted in place of the plate format. Keep in sync with the BE validator
        // (AdditionalShipmentInfoValidator.NO_VEHICLE_PLACEHOLDER).
        var noVehiclePlaceholder = 'XXXXXXXX';

        // Uppercase the truck registration as the user types so it matches the required format.
        vm.formatTruckRegistration = function() {
            if (vm.truckRegistration) {
                vm.truckRegistration = vm.truckRegistration.toUpperCase();
            }
        };

        // True only when a value is entered that does not match the plate format. Drives
        // openlmis-invalid directly (instead of ng-pattern) so the field shows only this message,
        // not the raw "pattern" validation-key on top of it.
        vm.isTruckRegistrationInvalid = function() {
            return !!vm.truckRegistration && vm.truckRegistration !== noVehiclePlaceholder &&
                !truckRegistrationPattern.test(vm.truckRegistration);
        };
        // SELV3-846: ends here

        vm.submit = function() {
            if (vm.occurredDate) {
                modalDeferred.resolve({
                    occurredDate: vm.occurredDate,
                    signature: vm.signature,
                    shipmentDate: vm.shipmentDate,
                    // SELV3-846: Additional shipment fields
                    volumesCount: vm.volumesCount,
                    icePacksCount: vm.icePacksCount,
                    packingPerson: vm.packingPerson,
                    truckRegistration: vm.truckRegistration,
                    trailerRegistration: vm.trailerRegistration,
                    securitySeal: vm.securitySeal
                    // SELV3-846: ends here
                });
            }
        };
        // SELV3-507: ends here
    }
})();
