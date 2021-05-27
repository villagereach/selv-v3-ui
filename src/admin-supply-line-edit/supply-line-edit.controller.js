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
     * @name admin-supply-line-edit.controller:SupplyLineEditController
     *
     * @description
     * Controller for managing supply line edit screen.
     */
    angular
        .module('admin-supply-line-edit')
        .controller('SupplyLineEditController', controller);

    controller.$inject = ['supplyLine', 'facilities', 'supervisoryNodes', 'SupplyLineResource',
        '$state', 'confirmService', 'loadingModalService', 'notificationService', '$q'];

    function controller(supplyLine, facilities, supervisoryNodes, SupplyLineResource,
                        $state, confirmService, loadingModalService, notificationService, $q) {

        var vm = this;

        vm.$onInit = onInit;
        //SELV3-339
        vm.update = update;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-edit.controller:SupplyLineEditController
         * @name supplyLine
         * @type {Object}
         *
         * @description
         * Contains supply line object.
         */
        vm.supplyLine = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-edit.controller:SupplyLineEditController
         * @name facilities
         * @type {Array}
         *
         * @description
         * List of all possible facilities.
         */
        vm.facilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-edit.controller:SupplyLineEditController
         * @name supervisoryNodes
         * @type {Array}
         *
         * @description
         * List of all possible supervisory nodes.
         */
        vm.supervisoryNodes = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-edit.controller:SupplyLineEditController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating SupplyLineEditController.
         */
        function onInit() {
            vm.supplyLine = supplyLine;
            //SELV3-339: facilities and supervisoryNodes added
            vm.facilities = facilities;
            vm.supervisoryNodes = supervisoryNodes;
        }

        //SELV3-339: Update the supply line
        /**
         * @ngdoc method
         * @methodOf admin-supply-line-edit.controller:SupplyLineEditController
         * @name update
         *
         * @description
         * Updates supply line.
         */
        function update() {
            return confirmService
                .confirm('adminSupplyLineEdit.update.confirm', 'adminSupplyLineEdit.update')
                .then(function() {
                    loadingModalService.open();
                    return new SupplyLineResource()
                        .update(vm.supplyLine);
                })
                .then(function() {
                    goToSupplyLineList();
                })
                .then(function() {
                    notificationService.success('adminSupplyLineEdit.supplyLineUpdatedSuccessfully');
                })
                .catch(function(error) {
                    loadingModalService.close();
                    notificationService.error('adminSupplyLineEdit.failure');
                    return $q.reject(error);
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-edit.controller:SupplyLineEditController
         * @name goToSupplyLineList
         *
         * @description
         * Redirects to supply line list.
         */
        function goToSupplyLineList() {
            $state.go('openlmis.administration.supplyLines', {}, {
                reload: true
            });
        }

    }
})();