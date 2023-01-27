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

import React, { useMemo, useEffect, useState }  from 'react';
import { useLocation } from 'react-router-dom';

import getService from '../../../react-components/utils/angular-utils';
import Table from '../../../react-components/table/table';
import TrashButton from '../../../react-components/buttons/trash-button';
import ResponsiveButton from '../../../react-components/buttons/responsive-button';

const AdminDhis2DatasetPage = () => {
    const location = useLocation();

    const [datasetsParams, setDatasetsParams] = useState([]);
    const [serverId, setServerId] = useState(null);

    const datasetService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    useEffect(() => {
        location.state = location?.state ?? JSON.parse(localStorage.getItem('stateLocation'));
        if (location.state !== undefined) {
            setServerId(location.state.data.serverId);
        }
    }, [location]);

    const fetchServerDatasetsList = () => {
            if (serverId) {
            datasetService.getServerDatasets(serverId)
                .then((fetchedServerDatasets) => {
                    const { content } = fetchedServerDatasets
                
                    const datasets = content.map((dataset) => ({
                        datasetId: dataset.id,
                        datasetName: dataset.name,
                        dhisDatasetId: dataset.dhisDatasetId,
                        cronExpression: dataset.cronExpression,
                        serverDto: dataset.serverDto
                    }))
                    setDatasetsParams(datasets);
                });
            }
    }

    useEffect(() => fetchServerDatasetsList(), [serverId]);

    useEffect(() => {}, [datasetsParams]);

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'datasetName'
            },
            {
                Header: 'ID',
                accessor: 'dhisDatasetId'
            },
            {
                Header: 'Schedule',
                accessor: 'cronExpression',
            },
            {
                Header: 'Actions',
                accessor: 'datasetId',
                Cell: ({ row: { values } }) => (
                     <div className='admin-dhis2-table-actions'>
                        <ResponsiveButton
                            onClick={() => {}}
                        >
                            View
                        </ResponsiveButton>
                        <TrashButton
                            onClick={() => {}}
                        />
                    </div>
                )
            },
        ],
        [datasetsParams]
    );

    return (
        <>
            <h2 className="admin-dhis2-table-title">Server Datasets</h2>
            <div className="admin-dhis-row">
                <div className="admin-dhis-main">
                    <div className="admin-dhis2-table-header">
                        <button 
                            className="add admin-dhis2-table-add-button"
                            onClick={() => {}}
                        >
                            Add Dataset
                        </button>
                    </div>
                    <Table
                        columns={columns}
                        data={datasetsParams}
                    />
                </div>
            </div>
        </>
    );
};

export default AdminDhis2DatasetPage;
