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

import React from 'react';
import { ToastContainer } from 'react-toastify';
import ReactDOM from 'react-dom';
import Routing from './Routing';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

(function () {
    'use strict';

    angular
        .module('admin-dhis2')
        .directive('adminDhis2', adminDhis2);

        adminDhis2.$inject = ['$q', 'authorizationService', 'permissionService', 'facilityService', 'loadingModalService'];

    function adminDhis2($q, authorizationService, permissionService, facilityService, loadingModalService) {
        return {
            template: '<div id="adminDhis2" class="admin-dhis2"></div>',
            replace: true,
            link: function () {
                const app = document.getElementById('adminDhis2');

                ReactDOM.render(
                    <>
                        <Routing 
                            asynchronousService={$q}
                            authorizationService={authorizationService}
                            permissionService={permissionService}
                            facilityService={facilityService}
                            loadingModalService={loadingModalService}
                        />, 
                        <ToastContainer theme="colored" />
                    </>,
                    app
                );
            }
        };
    }
})();
