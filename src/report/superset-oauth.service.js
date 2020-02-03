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
     * @name report:supersetOAuthService
     * @description
     * The service that allows authorizing the Superset application from the OpenLMIS side.
     * The functionality exposed by this service makes it possible to omit the default OAuth Approve page.
     */
    angular
        .module('report')
        .service('supersetOAuthService', supersetOAuthService);

    supersetOAuthService.$inject = ['supersetUrlFactory', '$q', '$http', '$httpParamSerializer', 'authUrl'];

    function supersetOAuthService(supersetUrlFactory, $q, $http, $httpParamSerializer, authUrl) {

        this.checkAuthorizationInSuperset = checkAuthorizationInSuperset;
        this.authorizeInSuperset = authorizeInSuperset;

        /**
         * @ngdoc method
         * @methodOf report:supersetOAuthService
         * @name checkAuthorizationInSuperset
         *
         * @description
         * The method that checks the status of authorization in Supserset.
         * If a user needs to be authorized the method returns state required for OAuth requests.
         *
         * @return {Object} Response from Superset with autorization status and state
         */
        function checkAuthorizationInSuperset() {
            return $http({
                method: 'GET',
                url: supersetUrlFactory.buildCheckSupersetAuthorizationUrl(),
                withCredentials: true
            })
                .then(function(response) {
                    return $q.resolve(response.data);
                });
        }

        /**
         * @ngdoc method
         * @methodOf report:supersetOAuthService
         * @name authorizeInSuperset
         *
         * @description
         * The method that authorizes the user in Superset.
         *
         * @param {String} username The username of the person trying to login
         * @param {String} password The password of the person is trying to login with
         * @param {String} supersetOAuthState The OAuth state received from Superset
         * @return {Promise} The promise for the authorization request
         */
        function authorizeInSuperset(username, password, supersetOAuthState) {
            return checkCredentials(username, password)
                .then(function() {
                    return sendOAuthRequest(username, password, supersetOAuthState);
                })
                .then(function() {
                    return approveSupersetIfNeeded(username, password);
                });
        }

        function checkCredentials(username, password) {
            return $http({
                method: 'POST',
                url: authUrl('/api/oauth/token?grant_type=password'),
                data: 'username=' + username + '&password=' + password,
                headers: {
                    Authorization: uiAuthorizationHeader(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .catch(function(response) {
                    var errorMessage;
                    if (response.status === 400) {
                        errorMessage = 'openlmisLogin.invalidCredentials';
                    } else if (response.status === -1) {
                        errorMessage = 'openlmisLogin.cannotConnectToServer';
                    } else {
                        errorMessage = 'openlmisLogin.unknownServerError';
                    }
                    return $q.reject(errorMessage);
                });
        }

        function sendOAuthRequest(username, password, supersetOAuthState) {
            return $http({
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Credentials': 'false',
                    Authorization: authorizationHeader(username, password)
                },
                url: supersetUrlFactory.buildSupersetOAuthRequestUrl(supersetOAuthState),
                withCredentials: true,
                ignoreAuthModule: true
            })
                .catch(function() {
                    return $q.reject('report.superset.oAuthLogin.invalidCredentialsOrOAuthRequest');
                });
        }

        function approveSupersetIfNeeded(username, password) {
            return checkAuthorizationInSuperset()
                .then(function(data) {
                    if (data.isAuthorized !== true) {
                        return approveSuperset(username, password);
                    }
                });
        }

        function approveSuperset(username, password) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: authorizationHeader(username, password)
                },
                url: supersetUrlFactory.buildApproveSupersetUrl(),
                data: $httpParamSerializer({
                    authorize: 'Authorize',
                    // eslint-disable-next-line camelcase
                    user_oauth_approval: 'true',
                    'scope.read': 'true',
                    'scope.write': 'true'
                }),
                withCredentials: true,
                ignoreAuthModule: true
            })
                .catch(function() {
                    return $q.reject('report.superset.oAuthLogin.unsuccessfulApprovingPermissions');
                });
        }

        function authorizationHeader(username, password) {
            var data = btoa(username + ':' + password);
            return 'Basic ' + data;
        }

        function uiAuthorizationHeader() {
            var data = btoa('@@AUTH_SERVER_CLIENT_ID' + ':' + '@@AUTH_SERVER_CLIENT_SECRET');
            return 'Basic ' + data;
        }
    }
}());
