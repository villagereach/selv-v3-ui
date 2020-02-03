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
     * @name report:SupersetOAuthLoginController
     * @description
     * Controller that drives the Superset OAuth login form.
     */
    angular
        .module('report')
        .controller('SupersetOAuthLoginController', SupersetOAuthLoginController);

    SupersetOAuthLoginController.$inject = [
        'modalDeferred', 'authorizationService', 'loadingModalService',
        'supersetOAuthService', 'MODAL_CANCELLED'
    ];

    function SupersetOAuthLoginController(modalDeferred, authorizationService, loadingModalService,
                                          supersetOAuthService, MODAL_CANCELLED) {
        var vm = this;
        vm.$onInit = onInit;

        vm.cancel = cancel;
        vm.doLogin = doLogin;

        /**
         * @ngdoc property
         * @propertyOf report:SupersetOAuthLoginController
         * @name username
         * @type {String}
         *
         * @description
         * The username of the currently signed-in user.
         */
        vm.username = undefined;

        /**
         * @ngdoc property
         * @propertyOf report:SupersetOAuthLoginController
         * @name supersetOAuthState
         * @type {String}
         *
         * @description
         * The Superset state which should be passed to Superset during next authorizing requests.
         */
        vm.supersetOAuthState = undefined;

        /**
         * @ngdoc property
         * @propertyOf report:SupersetOAuthLoginController
         * @name loginError
         * @type {String}
         *
         * @description
         * The message key of an error. If error not occurs, it should be set to undefined.
         */
        vm.loginError = undefined;

        /**
         * @ngdoc method
         * @methodOf report:SupersetOAuthLoginController
         * @name $onInit
         *
         * @description
         * The method that is executed on initiating SupersetOAuthLoginController.
         * It checks whatever the user is already authorized in Superset.
         */
        function onInit() {
            loadingModalService.open();
            vm.username = authorizationService.getUser().username;

            supersetOAuthService.checkAuthorizationInSuperset()
                .then(function(data) {
                    vm.supersetOAuthState = data.state;
                    if (data.isAuthorized === true) {
                        modalDeferred.resolve();
                    }
                })
                .catch(function() {
                    modalDeferred.reject('Superset is not available');
                })
                .finally(loadingModalService.close);
        }

        /**
         * @ngdoc method
         * @methodOf report:SupersetOAuthLoginController
         * @name cancel
         *
         * @description
         * The method that is invoked when user clicks the cancel button. It rejects the modal.
         */
        function cancel() {
            modalDeferred.reject(MODAL_CANCELLED);
        }

        /**
         * @ngdoc method
         * @methodOf report:SupersetOAuthLoginController
         * @name doLogin
         *
         * @description
         * The method that is invoked when the user clicks the authorize button.
         * It starts the authorization process to Superset via Superset OAuth service.
         */
        function doLogin() {
            loadingModalService.open();
            vm.loginError = undefined;
            supersetOAuthService.authorizeInSuperset(vm.username, vm.password, vm.supersetOAuthState)
                .then(function() {
                    modalDeferred.resolve();
                })
                .catch(function(errorMessage) {
                    vm.loginError = errorMessage;
                })
                .finally(loadingModalService.close);
        }
    }
}());
