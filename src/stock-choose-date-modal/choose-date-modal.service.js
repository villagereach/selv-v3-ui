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
     * @name stock-choose-date-modal.chooseDateModalService
     *
     * @description
     * This service will pop up a modal window for user to select occurred date and signature.
     */
    angular
        .module('stock-choose-date-modal')
        .service('chooseDateModalService', service);

    service.$inject = ['openlmisModalService', '$filter'];

    function service(openlmisModalService, $filter) {
        this.show = show;
        this.showWhenChoosingShipmentDate = showWhenChoosingShipmentDate;

        /**
         * @ngdoc method
         * @methodOf stock-choose-date-modal.chooseDateModalService
         * @name show
         *
         * @description
         * Shows modal that allows users to choose occurred date and signature.
         *
         * @return {Promise} resolved with chosen date and signature.
         */
        function show() {
            return openlmisModalService.createDialog(
                {
                    controller: 'ChooseDateModalController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-choose-date-modal/choose-date-modal.html',
                    show: true,
                    // SELV3-507: Allow user to enter Shipment Date
                    resolve: {
                        minDate: function() {
                            return $filter('isoDate')(new Date(1900, 1, 1));
                        },
                        showPhysicalInventoryWarning: function() {
                            return false;
                        }
                    }
                    // SELV3-507: ends here
                }
            ).promise.finally(function() {
                angular.element('.popover').popover('destroy');
            });
        }

        // SELV3-507: Allow user to enter Shipment Date
        /**
         * @ngdoc method
         * @methodOf stock-choose-date-modal.chooseDateModalService
         * @name showWhenChoosingShipmentDate
         *
         * @description
         * Shows modal that allows users to choose shipment date and signature.
         *
         * @return {Promise} resolved with chosen date and signature.
         */
        function showWhenChoosingShipmentDate(minimumShipmentDate, showPhysicalInventoryWarning) {
            return openlmisModalService.createDialog(
                {
                    controller: 'ChooseDateModalController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-choose-date-modal/choose-date-modal-shipment.html',
                    resolve: {
                        minDate: function() {
                            return minimumShipmentDate;
                        },
                        showPhysicalInventoryWarning: function() {
                            return showPhysicalInventoryWarning;
                        }

                    },
                    show: true
                }
            ).promise.finally(function() {
                angular.element('.popover').popover('destroy');
            });
        }
        // SELV3-507: ends here
    }

})();
