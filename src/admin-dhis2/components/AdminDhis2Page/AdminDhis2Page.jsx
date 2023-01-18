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

import React, { useMemo } from 'react';

import Table from '../../../react-components/table/table';
import TrashButton from '../../../react-components/buttons/trash-button';
import ResponsiveButton from '../../../react-components/buttons//responsive-button';

const AdminDhis2Page = ({data}) => {
    console.log(data)

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'orderable.productCode'
            },
            {
                Header: 'URL',
                accessor: 'orderable.fullProductName'
            },
            {
                Header: 'Username',
                accessor: 'soh',
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: ({ row: { index }, deleteRow }) => (
                     <div className='admin-dhis2-table-actions'>
                         <ResponsiveButton>View</ResponsiveButton>
                         <ResponsiveButton>Edit</ResponsiveButton>
                         <TrashButton onClick={() => deleteRow(index)} />
                    </div>
                )
            },
        ],
        []
    );

    return (
        <div className="order-table-container">
            <div className="order-create-table">
                <div className="admin-dhis2-table-header">
                    <h2>Servers</h2>
                    <button className="add">Add Server</button>
                </div>
                <Table
                    columns={columns}
                    data={columns}
                />
            </div>
        </div>
    )
};

export default AdminDhis2Page;
