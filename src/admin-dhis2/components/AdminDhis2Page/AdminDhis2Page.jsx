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

import EditableTable from '../../../react-components/table/editable-table';

const AdminDhis2Page = () => {
    const columns = useMemo(
        () => [
            {
                Header: 'Product Code',
                accessor: 'orderable.productCode'
            },
            {
                Header: 'Product',
                accessor: 'orderable.fullProductName'
            },
            {
                Header: 'SOH',
                accessor: 'soh',
            },
            {
                Header: 'Quantity',
                accessor: 'orderedQuantity',
            },
            {
                Header: 'Actions',
                accessor: 'id',
            }
        ],
        []
    );

    return (
        <div className="order-create-table-container">
            <div className="order-create-table">
                <div className="order-create-table-header">
                    <button className="add">Add</button>
                </div>
                <EditableTable
                    columns={[columns]}
                    data={[]}
                />
            </div>
        </div>
    )
};

export default AdminDhis2Page;
