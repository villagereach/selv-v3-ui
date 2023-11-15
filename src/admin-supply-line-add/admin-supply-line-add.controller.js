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
     * @name admin-supply-line-add.controller:AddSupplyLineController
     *
     * @description
     * Controller for managing supply line add screen.
     */
    angular
        .module('admin-supply-line-add')
        .controller('AddSupplyLineController', controller);

    controller.$inject = ['facilities', 'supervisoryNodes', 'programs', 'SupplyLineResource',
        '$state', 'confirmService', 'loadingModalService', 'notificationService', '$q'];

    function controller(facilities, supervisoryNodes, programs, SupplyLineResource,
                        $state, confirmService, loadingModalService, notificationService, $q) {

        var vm = this;

        vm.$onInit = onInit;
        vm.add = add;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-add.controller:AddSupplyLineController
         * @name facilities
         * @type {Array}
         *
         * @description
         * List of all possible facilities.
         */
        vm.facilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-add.controller:AddSupplyLineController
         * @name supervisoryNodes
         * @type {Array}
         *
         * @description
         * List of all possible supervisory nodes.
         */
        vm.supervisoryNodes = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-add.controller:AddSupplyLineController
         * @name programs
         * @type {Array}
         *
         * @description
         * List of all possible programs.
         */
        vm.programs = undefined;

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
         * @ngdoc method
         * @methodOf admin-supply-line-add.controller:AddSupplyLineController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating AddSupplyLineController.
         */
        function onInit() {
            vm.facilities = facilities;
            vm.supervisoryNodes = supervisoryNodes;
            vm.programs = programs;
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-add.controller:AddSupplyLineController
         * @name update
         *
         * @description
         * Updates supply line.
         */

        function add() {
            return confirmService
                .confirm('adminSupplyLineAdd.update.confirm', 'adminSupplyLineAdd.update')
                .then(function() {
                    loadingModalService.open();
                    return new SupplyLineResource()
                        .create(vm.supplyLine, null);
                })
                .then(function() {
                    goToSupplyLineList();
                })
                .then(function() {
                    notificationService.success('adminSupplyLineAdd.supplyLineUpdatedSuccessfully');
                })
                .catch(function(error) {
                    console.log(error);
                    loadingModalService.close();
                    notificationService.error('adminSupplyLineAdd.failure');
                    return $q.reject(error);
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-add.controller:AddSupplyLineController
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
