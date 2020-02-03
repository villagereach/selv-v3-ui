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

describe('SupersetOAuthLoginController', function() {

    var vm, $controller, $q, $rootScope, modalDeferred,
        authorizationService, loadingModalService, supersetOAuthService,
        MODAL_CANCELLED, user, isAuthorizedResponse, isNotAuthorizedResponse;

    beforeEach(function() {
        module('report');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');

            authorizationService = $injector.get('authorizationService');
            loadingModalService = $injector.get('loadingModalService');
            supersetOAuthService = $injector.get('supersetOAuthService');

            MODAL_CANCELLED = $injector.get('MODAL_CANCELLED');

            var UserDataBuilder = $injector.get('UserDataBuilder');
            user = new UserDataBuilder().build();

            spyOn(authorizationService, 'getUser').andReturn(user);
            spyOn(loadingModalService, 'open');
            spyOn(loadingModalService, 'close');
            spyOn(supersetOAuthService, 'authorizeInSuperset').andReturn($q.resolve());
            spyOn(supersetOAuthService, 'checkAuthorizationInSuperset')
                .andReturn($q.resolve(isNotAuthorizedResponse));
        });

        modalDeferred = $q.defer();
        isAuthorizedResponse = {
            isAuthorized: true
        };
        isNotAuthorizedResponse = {
            isAuthorized: false,
            state: 'test_state'
        };

        spyOn(modalDeferred, 'resolve');
        spyOn(modalDeferred, 'reject');

        vm = $controller('SupersetOAuthLoginController', {
            modalDeferred: modalDeferred
        });
    });

    describe('onInit', function() {

        it('should expose cancel method', function() {
            vm.$onInit();

            expect(angular.isFunction(vm.cancel)).toBe(true);
        });

        it('should expose doLogin method', function() {
            vm.$onInit();

            expect(angular.isFunction(vm.doLogin)).toBe(true);
        });

        it('should expose username', function() {
            vm.$onInit();

            expect(vm.username).toEqual(user.username);
        });

        it('should open loading modal', function() {
            vm.$onInit();

            expect(loadingModalService.open).toHaveBeenCalled();
        });

        it('should skip modal if the user is already authorized', function() {
            supersetOAuthService.checkAuthorizationInSuperset
                .andReturn($q.resolve(isAuthorizedResponse));

            vm.$onInit();
            $rootScope.$apply();

            expect(modalDeferred.resolve).toHaveBeenCalled();
        });

        it('should not skip modal and set state if the user is not authorized', function() {
            vm.$onInit();
            $rootScope.$apply();

            expect(vm.supersetOAuthState).toEqual(isNotAuthorizedResponse.state);
            expect(modalDeferred.resolve).not.toHaveBeenCalled();
            expect(modalDeferred.reject).not.toHaveBeenCalled();
        });

        it('should reject modal if cannot fetch response from Supserset', function() {
            supersetOAuthService.checkAuthorizationInSuperset
                .andReturn($q.reject());

            vm.$onInit();
            $rootScope.$apply();

            expect(modalDeferred.reject).toHaveBeenCalled();
        });
    });

    describe('cancel', function() {

        beforeEach(function() {
            vm.$onInit();
            vm.cancel();
        });

        it('should reject modal with cancelled status', function() {
            expect(modalDeferred.reject).toHaveBeenCalledWith(MODAL_CANCELLED);
        });
    });

    describe('doLogin', function() {

        beforeEach(function() {
            vm.username = 'test_username';
            vm.password = 'test_password';
            vm.supersetOAuthState = isNotAuthorizedResponse.state;

            vm.$onInit();
            $rootScope.$apply();
        });

        it('should open loading modal', function() {
            vm.doLogin();

            expect(loadingModalService.open).toHaveBeenCalled();
        });

        it('should close loading modal after processing', function() {
            vm.doLogin();
            $rootScope.$apply();

            expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should call authorizeInSuperset with modal properties', function() {
            vm.doLogin();

            expect(supersetOAuthService.authorizeInSuperset)
                .toHaveBeenCalledWith(vm.username, vm.password, vm.supersetOAuthState);
        });

        it('should not close the modal if credentials are not correct', function() {
            supersetOAuthService.authorizeInSuperset.andReturn($q.reject('openlmisLogin.invalidCredentials'));

            vm.doLogin();
            $rootScope.$apply();

            expect(vm.loginError).toEqual('openlmisLogin.invalidCredentials');
            expect(modalDeferred.resolve).not.toHaveBeenCalled();
            expect(modalDeferred.reject).not.toHaveBeenCalled();
        });

        it('should resolve the modal after approving', function() {
            vm.doLogin();
            $rootScope.$apply();

            expect(modalDeferred.resolve).toHaveBeenCalled();
        });
    });
});
