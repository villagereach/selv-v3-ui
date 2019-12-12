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
     * @name admin-orderable-edit.controller:OrderableAddEditGeneralController
     *
     * @description
     * Controller for managing orderable view screen.
     */
    angular
        .module('admin-orderable-edit')
        .controller('OrderableAddEditGeneralController', controller);

    controller.$inject = [
        'orderable', '$state', 'OrderableResource', 'FunctionDecorator', 'successNotificationKey',
        'errorNotificationKey', 'orderableListRelativePath',
        // SELV3-13: Added net volume and storage temperature properties to Orderables
        '$q'
        // SELV3-13: ends here
    ];

    function controller(orderable, $state, OrderableResource, FunctionDecorator, successNotificationKey,
                        errorNotificationKey, orderableListRelativePath,
                        // SELV3-13: Added net volume and storage temperature properties to Orderables
                        $q) {
        // SELV3-13: ends here

        var vm = this,
            isNew;

        vm.$onInit = onInit;
        vm.goToOrderableList  = goToOrderableList;
        vm.saveOrderable = new FunctionDecorator()
            .decorateFunction(saveOrderable)
            .withSuccessNotification(successNotificationKey)
            .withErrorNotification(errorNotificationKey)
            .withLoading(true)
            .getDecoratedFunction();
        // SELV3-13: Added net volume and storage temperature properties to Orderables
        vm.storageTempChanged = storageTempChanged;
        // SELV3-13: ends here

        /**
         * @ngdoc method
         * @propertyOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating OrderableAddEditGeneralController.
         */
        function onInit() {
            vm.orderable = orderable;
            isNew = !orderable.id;
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name goToOrderableList
         *
         * @description
         * Redirects to orderable list screen.
         */
        function goToOrderableList() {
            $state.go(orderableListRelativePath, {}, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name saveOrderable
         *
         * @description
         * Updates the orderable and return to the orderable list on success.
         */
        function saveOrderable() {
            // SELV3-13: Added net volume and storage temperature properties to Orderables
            validateStorageTemp();
            var noErrors = !(vm.orderable.extraData && vm.orderable.extraData.storageTempInvalid);
            if (noErrors) {
            // SELV3-13: ends here
                return new OrderableResource()
                    .update(vm.orderable)
                    .then(function(orderable) {
                        if (isNew) {
                            $state.go('^.edit.general', {
                                id: orderable.id
                            });
                        } else {
                            goToOrderableList();
                        }
                    });
            }
            return $q.reject();
        }

        // SELV3-13: Added net volume and storage temperature properties to Orderables
        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name validateStorageTemp
         *
         * @description
         * Checks if max storage temperature is not lower than min storage temperature.
         */
        function validateStorageTemp() {
            if (vm.orderable.extraData
                && vm.orderable.extraData.maxStorageTemp && vm.orderable.extraData.minStorageTemp
                && vm.orderable.extraData.maxStorageTemp < vm.orderable.extraData.minStorageTemp) {
                vm.orderable.extraData.storageTempInvalid = 'adminOrderableEdit.invalidStorageTemp';
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name storageTempChanged
         *
         * @description
         * Deletes message from extraData.storageTempInvalid after changing max storage temp value
         */
        function storageTempChanged() {
            if (vm.orderable && vm.orderable.extraData && vm.orderable.extraData.storageTempInvalid) {
                vm.orderable.extraData.storageTempInvalid = undefined;
            }
        }
        // SELV3-13: ends here
    }
})();
