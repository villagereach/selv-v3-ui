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
        vm.maximumTemperatureChanged = maximumTemperatureChanged;
        vm.minimumTemperatureChanged = minimumTemperatureChanged;
        vm.inBoxCubeDimensionChanged = inBoxCubeDimensionChanged;
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
            var noErrors = isMinimumTemperatureValid() && isInBoxCubeDimensionValid();
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
            // SELV3-13: Added net volume and storage temperature properties to Orderables
            }
            return $q.reject();
            // SELV3-13: ends here
        }

        // SELV3-13: Added net volume and storage temperature properties to Orderables
        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name maximumTemperatureChanged
         *
         * @description
         * Deletes/Adds temperatureMeasurementUnitCode to maximumTemperature after changing value,
         * validates temperatures
         */
        function maximumTemperatureChanged() {
            if (vm.orderable.minimumTemperature) {
                vm.orderable.minimumTemperature.invalid = undefined;
            }

            if (vm.orderable.maximumTemperature.value === null) {
                vm.orderable.maximumTemperature = undefined;
            } else {
                vm.orderable.maximumTemperature.temperatureMeasurementUnitCode = 'CEL';
                validateStorageTemp();
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name minimumTemperatureChanged
         *
         * @description
         * Deletes/Adds temperatureMeasurementUnitCode to minimumTemperature after changing value,
         * validates temperatures
         */
        function minimumTemperatureChanged() {
            vm.orderable.minimumTemperature.invalid = undefined;
            if (vm.orderable.minimumTemperature.value === null) {
                vm.orderable.minimumTemperature = undefined;
            } else {
                vm.orderable.minimumTemperature.temperatureMeasurementUnitCode = 'CEL';
                validateStorageTemp();
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name inBoxCubeDimensionChanged
         *
         * @description
         * Deletes/Adds measurementUnitCode to inBoxCubeDimension after changing value,
         * validates net volume
         */
        function inBoxCubeDimensionChanged() {
            if (vm.orderable.inBoxCubeDimension.value === null) {
                vm.orderable.inBoxCubeDimension = undefined;
            } else {
                vm.orderable.inBoxCubeDimension.measurementUnitCode = 'MLT';
                validateNetVolume();
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name validateStorageTemp
         *
         * @description
         * Checks if min storage temperature is not greater than max storage temperature.
         */
        function validateStorageTemp() {
            if (vm.orderable.minimumTemperature && vm.orderable.maximumTemperature &&
                vm.orderable.minimumTemperature.value > vm.orderable.maximumTemperature.value) {
                vm.orderable.minimumTemperature.invalid =
                'adminOrderableEdit.minimumTemperature.invalid';
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name validateNetVolume
         *
         * @description
         * Checks if net volume exists and if is not 0.
         */
        function validateNetVolume() {
            vm.orderable.inBoxCubeDimension.invalid = undefined;
            if (vm.orderable.inBoxCubeDimension && vm.orderable.inBoxCubeDimension.value !== null &&
                vm.orderable.inBoxCubeDimension.value <= 0) {
                vm.orderable.inBoxCubeDimension.invalid =
                'adminOrderableEdit.inBoxCubeDimension.invalid';
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name isMinimumTemperatureValid
         *
         * @description
         * Checks if Minimum Temperature exists and if is valid
         */
        function isMinimumTemperatureValid() {
            return !vm.orderable.minimumTemperature ||
            (vm.orderable.minimumTemperature && !vm.orderable.minimumTemperature.invalid);
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-edit.controller:OrderableAddEditGeneralController
         * @name isInBoxCubeDimensionValid
         *
         * @description
         * Checks if net volume exists and if is valid
         */
        function isInBoxCubeDimensionValid() {
            return !vm.orderable.inBoxCubeDimension ||
            (vm.orderable.inBoxCubeDimension && !vm.orderable.inBoxCubeDimension.invalid);
        }
        // SELV3-13: ends here
    }
})();
