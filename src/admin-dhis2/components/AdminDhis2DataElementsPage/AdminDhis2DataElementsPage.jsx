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
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import Table from '../../../react-components/table/table';
import TrashButton from '../../../react-components/buttons/trash-button';
import ResponsiveButton from '../../../react-components/buttons/responsive-button';
import confirmDialogAlert from '../../../react-components/modals/confirm';
import Modal from "../Modal/Modal";
import AdminDhis2DataElementForm from "../AdminDhis2DataElementForm/AdminDhis2DataElementForm";

const AdminDhis2DataElementsPage = () => {
    const location = useLocation();

    const [deletedDataElement, setDeletedDataElement] = useState(''); 
    const [dataElementsParams, setDataElementsParams] = useState([]);
    const [serverId, setServerId] = useState(null);
    const [datasetId, setDatasetId] = useState(null);
    const [displayAddModal, setDisplayAddModal] = useState(false);

    const datasetService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    useEffect(() => {
        const serverItem = JSON.parse(localStorage.getItem('stateLocation'));
        const datasetItem = JSON.parse(localStorage.getItem('datasetState'));

        if (serverItem !== undefined || datasetItem !== undefined) {
            setServerId(serverItem.data.serverId);
            setDatasetId(datasetItem.data.datasetId);
        }
    }, [location]);

    const fetchDataElementsList = () => {
        if (datasetId) {
            datasetService.getDataElements(serverId, datasetId)
                .then((fetchedDataElements) => {
                    const { content } = fetchedDataElements;

                    const elements = content.map((element) => ({
                        dataElementId: element.id,
                        dataElementName: element.name,
                        dataElementIndicator: element.indicator,
                        dataElementSource: element.source,
                        dataElementOrderable: element.orderable,
                        dataElementCategoryCombo: element.categoryCombo,
                        dataElement: element.element,
                    }));
                    setDataElementsParams(elements);
                })
        }
    }

    useEffect(() => fetchDataElementsList(), [datasetId]);

    const removeDataElement = (dataElement) => {
        datasetService.removeDataElement(serverId, datasetId, dataElement.dataElementId)
            .then(() => {
                fetchDataElementsList();
                toast.success('Data Element has been removed!');
            });
    }

    useEffect(() => {}, [dataElementsParams]);

    const toggleAddModal = () => {
        setDisplayAddModal(!displayAddModal);
    };

    const onSubmitAdd = () => {
        toggleAddModal();
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'dataElementName'
            },
            {
                Header: 'Indicator Type',
                accessor: 'dataElementSource'
            },
            {
                Header: 'Indicator',
                accessor: 'dataElementIndicator',
            },
            {
                Header: 'Product',
                accessor: 'dataElementOrderable',
            },
            {
                Header: 'Data Element',
                accessor: 'dataElement',
                Cell: props => 
                    <div>
                        {props.row.original.dataElement} - {props.row.original.dataElementCategoryCombo}
                    </div>
            },
            {
                Header: 'Actions',
                accessor: 'dataElementId',
                Cell: ({ row: { values } }) => (
                    <div className='admin-dhis2-table-actions'>
                        <ResponsiveButton
                            onClick={() => {}}
                        >
                            View
                        </ResponsiveButton>
                        <TrashButton
                            onClick={() => confirmDialogAlert({
                                title: `Are you sure you want to remove Data Element ${values.dataElementName}?`,
                                onConfirm: () => {
                                    setDeletedDataElement(values.dataElementId); 
                                    removeDataElement(values);
                                }
                            })}
                        />
                    </div>
                )
            },
        ],
        [dataElementsParams]
    );

    return (
        <>
            <h2 className="admin-dhis2-table-title">Data Elements Mapping</h2>
            <div className="admin-dhis-row">
                <div className="admin-dhis-main">
                    <div className="admin-dhis2-table-header">
                        <button
                            className="add admin-dhis2-table-add-button"
                            onClick={toggleAddModal}
                        >
                            Add Data Element Mapping
                        </button>
                    </div>
                    <Table
                        columns={columns}
                        data={dataElementsParams}
                    />
                </div>
            </div>
            <Modal
                isOpen={displayAddModal}
                children={[
                    <AdminDhis2DataElementForm
                        onSubmit={onSubmitAdd}
                        onCancel={toggleAddModal}
                        refetch={fetchDataElementsList}
                        serverId={serverId}
                        datasetId={datasetId}
                        dataElementsParams={dataElementsParams}
                        deletedDataElement={deletedDataElement}
                    />
                ]}
            />
        </>
    );
};

export default AdminDhis2DataElementsPage;
