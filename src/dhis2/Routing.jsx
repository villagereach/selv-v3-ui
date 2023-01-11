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