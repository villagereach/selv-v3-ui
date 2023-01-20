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

import React, { useMemo, useEffect, useState } from 'react';

import getService from '../../../react-components/utils/angular-utils';
import Table from '../../../react-components/table/table';
import TrashButton from '../../../react-components/buttons/trash-button';
import ResponsiveButton from '../../../react-components/buttons/responsive-button';
import confirmDialogAlert from '../../../react-components/modals/confirm';

const AdminDhis2ServersPage = () => {
    const [serversParams, setServersParams] = useState([]);

    const serverServices = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    const fetchServersList = () => {
        serverServices.getServerConfig()
            .then((fetchedServer) => {
                const { content } = fetchedServer

                const serversParams = content.map((server) => ({
                    serverId: server.id,
                    serverName: server.name,
                    serverUrl: server.url,
                    serverUsername: server.username
                }))
                setServersParams(serversParams);
            });
    }

    useEffect(() => fetchServersList(),[]);

    const removeServer = (server) => {
        serverServices.removeServer(server.serverId)
          .then(() => {
            fetchServersList();
          });
    }

    useEffect(() => {}, [serversParams]);

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'serverName'
            },
            {
                Header: 'URL',
                accessor: 'serverUrl'
            },
            {
                Header: 'Username',
                accessor: 'serverUsername',
            },
            {
                Header: 'Actions',
                accessor: 'serverId',
                Cell: ({ row: { values } }) => (
                     <div className='admin-dhis2-table-actions'>
                        <ResponsiveButton>View</ResponsiveButton>
                        <ResponsiveButton>Edit
                        </ResponsiveButton>

                        <TrashButton
                            onClick={() => confirmDialogAlert({
                                title: `Are you sure you want to remove server ${values.serverName}?`,
                                onConfirm: () => removeServer(values)
                            })}
                        />
                    </div>
                )
            },
        ],
        [serversParams]
    );

    return (
        <>
            <div className="admin-dhis2-table-header">
                <h2 className="admin-dhis2-table-title">Servers</h2>
                <button className="add admin-dhis2-table-add-button">Add Server</button>
            </div>
            <Table
                columns={columns}
                data={serversParams}
            />
        </>
    )
};

export default AdminDhis2ServersPage;
