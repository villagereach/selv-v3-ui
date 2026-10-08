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

describe('LoginController', function() {

    beforeEach(function() {

        module('openlmis-login', function($provide) {
            // Turn off AuthToken
            $provide.factory('accessTokenInterceptor', function() {
                return {};
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$timeout = $injector.get('$timeout');
            this.$controller = $injector.get('$controller');
            this.loginService = $injector.get('loginService');
            this.loadingModalService = $injector.get('loadingModalService');
        });

        this.modalDeferred = this.$q.defer();

        this.vm = this.$controller('LoginController', {
            modalDeferred: this.modalDeferred
        });
    });

    describe('doLogin', function() {

        var username, validPassword, invalidPassword;

        beforeEach(function() {
            spyOn(this.loginService, 'login');
            spyOn(this.loadingModalService, 'open');
            spyOn(this.loadingModalService, 'close');

            username = 'john';
            validPassword = 'good-password';
            invalidPassword = 'bad-password';
        });

        it('should not login and show error when server returns error', function() {
            this.loginService.login.andReturn(this.$q.reject('error'));

            this.vm.username = username;
            this.vm.password = invalidPassword;

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(this.loginService.login).toHaveBeenCalledWith(username, invalidPassword);
            expect(this.vm.loginError).toEqual('error');
        });

        it('should clear password on failed login attempt', function() {
            this.loginService.login.andReturn(this.$q.reject());

            this.vm.username = username;
            this.vm.password = invalidPassword;

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(this.loginService.login).toHaveBeenCalledWith(username, invalidPassword);
            expect(this.vm.password).toBe(undefined);
        });

        it('should not clear password on successful login attempt', function() {
            this.loginService.login.andReturn(this.$q.resolve());

            this.vm.username = username;
            this.vm.password = validPassword;

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(this.loginService.login).toHaveBeenCalledWith(username, validPassword);
            expect(this.vm.password).toBe(validPassword);
        });

        it('should open loading modal', function() {
            this.loginService.login.andReturn(this.$q.resolve());

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(this.loadingModalService.open).toHaveBeenCalled();
        });

        it('should close loading modal after successful login', function() {
            this.loginService.login.andReturn(this.$q.resolve());

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should close loading modal after failed login', function() {
            this.loginService.login.andReturn(this.$q.reject());

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('will resolve modalDeferred promise if login is successful', function() {
            var resolved;
            this.modalDeferred.promise.then(function() {
                resolved = true;
            });

            this.loginService.login.andReturn(this.$q.reject());
            this.vm.username = username;
            this.vm.password = invalidPassword;

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(resolved).not.toBe(true);

            this.loginService.login.andReturn(this.$q.resolve());
            this.vm.password = validPassword;

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(resolved).toBe(true);
        });

        it('should emit "openlmis-auth.login" event when successfully logged in', function() {
            var success = false;
            this.$rootScope.$on('openlmis-auth.login', function() {
                success = true;
            });

            this.loginService.login.andReturn(this.$q.resolve());
            this.vm.username = username;
            this.vm.password = validPassword;

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(success).toBe(true);
        });

        it('should not emit "openlmis-auth.login" event when login failed', function() {
            var success = true;
            this.$rootScope.$on('openlmis-auth.login', function() {
                success = false;
            });

            this.loginService.login.andReturn(this.$q.reject());
            this.vm.username = username;
            this.vm.password = invalidPassword;

            this.vm.doLogin();
            this.$rootScope.$apply();

            expect(success).toBe(true);
        });
    });

    describe('togglePassword', function() {

        beforeEach(function() {
            this.mockPasswordField = {
                focus: function() {}
            };
            document.getElementById = function(id) {
                if (id === 'login-password') {
                    return this.mockPasswordField;
                }
                return null;
            }.bind(this);
        });

        afterEach(function() {
            delete document.getElementById;
        });

        it('should toggle showPassword from false to true', function() {
            this.vm.showPassword = false;

            this.vm.togglePassword();
            this.$timeout.flush();

            expect(this.vm.showPassword).toBe(true);
        });

        it('should toggle showPassword from true to false', function() {
            this.vm.showPassword = true;

            this.vm.togglePassword();
            this.$timeout.flush();

            expect(this.vm.showPassword).toBe(false);
        });

        it('should set isToggling to true during toggle', function() {
            this.vm.isToggling = false;
            this.vm.showPassword = false;

            this.vm.togglePassword();

            expect(this.vm.isToggling).toBe(true);
        });

        it('should focus on password field after toggle', function() {
            this.vm.showPassword = false;
            spyOn(this.mockPasswordField, 'focus');

            this.vm.togglePassword();
            this.$timeout.flush();

            expect(this.mockPasswordField.focus).toHaveBeenCalled();
        });
    });
});
