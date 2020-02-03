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

describe('supersetOAuthService', function() {

    var supersetOAuthService, $httpBackend, authUrl, supersetUrlFactory,
        isAuthorizedResponse, isNotAuthorizedResponse, CHECK_SUPERSET_AUTORIZATION_URL;

    beforeEach(function() {
        module('report');

        inject(function($injector) {
            supersetOAuthService = $injector.get('supersetOAuthService');
            $httpBackend = $injector.get('$httpBackend');

            authUrl = $injector.get('authUrl');
            supersetUrlFactory = $injector.get('supersetUrlFactory');

            CHECK_SUPERSET_AUTORIZATION_URL = supersetUrlFactory.buildCheckSupersetAuthorizationUrl();
        });

        isAuthorizedResponse = {
            isAuthorized: true
        };
        isNotAuthorizedResponse = {
            isAuthorized: false,
            state: 'test_state'
        };
    });

    describe('checkAuthorizationInSuperset', function() {

        it('should return proper response if a user is already authorized', function() {
            $httpBackend.expectGET(CHECK_SUPERSET_AUTORIZATION_URL)
                .respond(200, isAuthorizedResponse);

            var result;
            supersetOAuthService.checkAuthorizationInSuperset()
                .then(function(response) {
                    result = response;
                });
            $httpBackend.flush();

            expect(result.isAuthorized).toBe(true);
        });

        it('should return proper response with state if the user is not authorized', function() {
            $httpBackend.whenGET(CHECK_SUPERSET_AUTORIZATION_URL)
                .respond(200, isNotAuthorizedResponse);

            var result;
            supersetOAuthService.checkAuthorizationInSuperset()
                .then(function(response) {
                    result = response;
                });
            $httpBackend.flush();

            expect(result.isAuthorized).toBe(false);
            expect(result.state).toEqual('test_state');
        });
    });

    describe('authorizeInSuperset', function() {

        var checkCredentialsEndpointMock, checkAuthorizationEndpointMock, state, username, password;

        beforeEach(function() {
            checkCredentialsEndpointMock = $httpBackend
                .whenPOST(authUrl('/api/oauth/token?grant_type=password'))
                .respond(200);

            checkAuthorizationEndpointMock = $httpBackend
                .whenGET(CHECK_SUPERSET_AUTORIZATION_URL)
                .respond(200, isNotAuthorizedResponse);

            username = 'test_username';
            password = 'test_password';
            state = isNotAuthorizedResponse.state;
        });

        it('should send check credentials request with authorization header to OpenLMIS', function() {
            $httpBackend.expectPOST(authUrl('/api/oauth/token?grant_type=password'),
                function(data) {
                    return isString(data) && data.indexOf('username') !== -1 && data.indexOf('password') !== -1;
                },
                function(headers) {
                    var authorizationHeader = headers['Authorization'];
                    return isString(authorizationHeader) && authorizationHeader.startsWith('Basic');
                });

            supersetOAuthService.authorizeInSuperset(username, password, state);
            $httpBackend.flush();
        });

        it('should not send OAuth request if credentials are not correct', function() {
            var oauthRequestUrl = supersetUrlFactory.buildSupersetOAuthRequestUrl(state);
            var forbiddenCallTriggered = false;

            checkCredentialsEndpointMock.respond(400);
            $httpBackend.whenGET(oauthRequestUrl).respond(function() {
                forbiddenCallTriggered = true;
                return [400, ''];
            });

            var error;
            supersetOAuthService.authorizeInSuperset(username, password, state)
                .catch(function(response) {
                    error = response;
                });
            $httpBackend.flush();

            expect(error).not.toBeUndefined();
            expect(forbiddenCallTriggered).toBe(false);
        });

        it('should send OAuth request with authorization header to OpenLMIS', function() {
            var oauthRequestUrl = supersetUrlFactory.buildSupersetOAuthRequestUrl(state);

            $httpBackend.expectGET(oauthRequestUrl, function(headers) {
                var authorizationHeader = headers['Authorization'];
                return isString(authorizationHeader) && authorizationHeader.startsWith('Basic');
            });

            supersetOAuthService.authorizeInSuperset(username, password, state);
            $httpBackend.flush();
        });

        it('should check whatever the user is already approved after OAuth request', function() {
            var oauthRequestUrl = supersetUrlFactory.buildSupersetOAuthRequestUrl(state);

            $httpBackend.whenGET(oauthRequestUrl).respond(200);
            $httpBackend.expectGET(CHECK_SUPERSET_AUTORIZATION_URL);

            supersetOAuthService.authorizeInSuperset(username, password, state);
            $httpBackend.flush();
        });

        it('should not approve OAuth request if the application is already approved', function() {
            var oauthRequestUrl = supersetUrlFactory.buildSupersetOAuthRequestUrl(state);
            var approveOAuthRequestUrl = supersetUrlFactory.buildApproveSupersetUrl();
            var forbiddenCallTriggered = false;

            $httpBackend.whenGET(oauthRequestUrl).respond(200);
            checkAuthorizationEndpointMock.respond(200, isAuthorizedResponse);
            $httpBackend.whenPOST(approveOAuthRequestUrl).respond(function() {
                forbiddenCallTriggered = true;
                return [400, ''];
            });

            supersetOAuthService.authorizeInSuperset(username, password, state);
            $httpBackend.flush();

            expect(forbiddenCallTriggered).toBe(false);
        });

        it('should send proper approve OAuth request if the application is not approved', function() {
            var oauthRequestUrl = supersetUrlFactory.buildSupersetOAuthRequestUrl(state);
            var approveOAuthRequestUrl = supersetUrlFactory.buildApproveSupersetUrl();

            $httpBackend.whenGET(oauthRequestUrl).respond(200);
            $httpBackend.expectPOST(approveOAuthRequestUrl,
                'authorize=Authorize&scope.read=true&scope.write=true&user_oauth_approval=true',
                function(headers) {
                    var authorizationHeader = headers['Authorization'];
                    return isString(headers['Authorization']) && authorizationHeader.startsWith('Basic');
                });

            supersetOAuthService.authorizeInSuperset(username, password, state);
            $httpBackend.flush();
        });

        it('should resolve the modal after approving', function() {
            var state = isNotAuthorizedResponse.state;
            var oauthRequestUrl = supersetUrlFactory.buildSupersetOAuthRequestUrl(state);
            var approveOAuthRequestUrl = supersetUrlFactory.buildApproveSupersetUrl();

            $httpBackend.whenGET(oauthRequestUrl).respond(200);
            $httpBackend.whenPOST(approveOAuthRequestUrl).respond(200);

            var error;
            supersetOAuthService.authorizeInSuperset(username, password, state)
                .catch(function(response) {
                    error = response;
                });
            $httpBackend.flush();

            expect(error).toBeUndefined();
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    function isString(value) {
        return value && (typeof value === 'string' || value instanceof String);
    }
});
