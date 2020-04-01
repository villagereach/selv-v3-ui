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
     * @name stock-add-products-modal.addProductModalService
     *
     * @description
     * This service will pop up a modal window for user to select products.
     */
    angular
        .module('stock-add-products-modal')
        .service('addProductsModalService', service);

    service.$inject = ['openlmisModalService'];

    function service(openlmisModalService) {
        this.show = show;

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.addProductModalService
         * @name show
         *
         * @description
         * Shows modal that allows users to choose products.
         *
         * @param  {Array}   availableItems orderable + lot items that can be selected
         * @param  {Array}   selectedItems  orderable + lot items that were added already
         * @return {Promise}                resolved with selected products.
         */
        function show(availableItems, selectedItems) {
            return openlmisModalService.createDialog(
                {
                    controller: 'AddProductsModalController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-add-products-modal/add-products-modal.html',
                    show: true,
                    resolve: {
                        availableItems: function() {
                            return availableItems;
                        },
                        selectedItems: function() {
                            return selectedItems;
                        },
                        hasPermissionToAddNewLot: function(permissionService, ADMINISTRATION_RIGHTS,
                            authorizationService) {
                            return permissionService.hasPermissionWithAnyProgramAndAnyFacility(
                                authorizationService.getUser().user_id,
                                {
                                    right: ADMINISTRATION_RIGHTS.LOTS_MANAGE
                                }
                            )
                                .then(function() {
                                    return true;
                                })
                                .catch(function() {
                                    return false;
                                });
                        }
                        // SELV3-142: ends here
                    }
                }
            ).promise.finally(function() {
                angular.element('.popover').popover('destroy');
            });
        }
    }

})();