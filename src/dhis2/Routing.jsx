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
import Breadcrumbs from '../react-components/breadcrumbs/breadcrumbs';
import Dhis2Page from './components/Dhis2Page';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

const Routing = () => (
    <div className="page-responsive">
        <Router basename="/" hashType="hashbang">
            <Breadcrumbs routes={[ { path: "/administration/dhis2", breadcrumb: 'DHIS2' } ]} />
            <Switch>
                <Route exact path="/administration/dhis2">
                    <Dhis2Page />
                </Route>
            </Switch>
        </Router>
    </div>
);

export default Routing;