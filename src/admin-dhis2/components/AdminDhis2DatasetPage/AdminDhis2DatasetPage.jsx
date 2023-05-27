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
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import Table from '../../../react-components/table/table';
import TrashButton from '../../../react-components/buttons/trash-button';
import ResponsiveButton from '../../../react-components/buttons/responsive-button';
import confirmDialogAlert from '../../../react-components/modals/confirm';

import Modal from '../Modal/Modal';
import AdminDhis2DatasetForm from '../AdminDhis2DatasetForm/AdminDhis2DatasetForm';
import AdminDhis2DatasetSyncForm from '../AdminDhis2DatasetSyncForm/AdminDhis2DatasetSyncForm';
import AdminDhis2PeriodMappingForm from '../AdminDhis2PeriodMappingForm/AdminDhis2PeriodMappingForm';

const AdminDhis2DatasetPage = ({ asynchronousService, authorizationService, permissionService, facilityService }) => {
    const location = useLocation();
    const history = useHistory();

    const [datasetsParams, setDatasetsParams] = useState([]);
    const [datasetToSyncId, setDatasetToSyncId] = useState(null);
    const [serverId, setServerId] = useState(null);
    const [displayAddModal, setDisplayAddModal] = useState(false);
    const [displaySyncModal, setDisplaySyncModal] = useState(false);
    const [displayMappingModal, setDisplayMappingModal] = useState(false);

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
                    const { content } = fetchedServerDatasets;

                    const datasets = content.map((dataset) => ({
                        datasetId: dataset.id,
                        datasetName: dataset.name,
                        dhisDatasetId: dataset.dhisDatasetId,
                        cronExpression: dataset.cronExpression,
                        serverDto: dataset.serverDto
                    }));
                    setDatasetsParams(datasets);
                });
            }
    }

    useEffect(() => fetchServerDatasetsList(), [serverId]);

    const removeDataset = (dataset) => {
        datasetService.removeDataset(serverId, dataset.datasetId)
            .then(() => {
                fetchServerDatasetsList();
                toast.success('Dataset has been removed!');
            });
    }

    useEffect(() => {}, [datasetsParams]);

    const toggleAddModal = () => {
        setDisplayAddModal(!displayAddModal);
    };

    const toggleSyncModal = () => {
        setDisplaySyncModal(!displaySyncModal);
    }

    const toggleMappingModal = () => {
        setDisplayMappingModal(!displayMappingModal);
    };

    const selectDatasetToSync = (value) => {
        setDatasetToSyncId(value.datasetId);
        toggleSyncModal();
    } 

    const onSubmitAdd = () => {
        toggleAddModal();
    };

    const onSubmitMappingModal = () => {
        toggleMappingModal();
    }

    const onSubmitSyncModal = () => {
        toggleSyncModal();
    }

    const goToDataElementsPage = (data) => {
        const datasetState = {
            data: data,
        };
        const serverItem = JSON.parse(localStorage.getItem('stateLocation'));

        localStorage.setItem('datasetState', JSON.stringify(datasetState));
        history.push({
            pathname: `/administration/dhis2/${serverItem.data.serverName}/${data.datasetName}`,
            state: datasetState
        });
    }

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
                            onClick={() => goToDataElementsPage(values)}
                        >
                            Map Data Elements
                        </ResponsiveButton>
                        <ResponsiveButton
                            onClick={toggleMappingModal}
                        >
                            Map Periods
                        </ResponsiveButton>
                        <button
                            onClick={() => selectDatasetToSync(values)}
                        >
                            Sync
                        </button>
                        <TrashButton
                            onClick={() => confirmDialogAlert({
                                title: `Are you sure you want to remove dataset ${values.datasetName}?`,
                                onConfirm: () => removeDataset(values)
                            })}
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
                            onClick={toggleAddModal}
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
            <Modal
                isOpen={displayAddModal}
                children={[
                    <AdminDhis2DatasetForm
                        onSubmit={onSubmitAdd}
                        onCancel={toggleAddModal}
                        refetch={fetchServerDatasetsList}
                        serverId={serverId}
                    />
                ]}
            />
            <Modal
                isOpen={displaySyncModal}
                children={[
                    <AdminDhis2DatasetSyncForm
                        onSubmit={onSubmitSyncModal}
                        onCancel={toggleSyncModal}
                        serverId={serverId}
                        datasetId={datasetToSyncId}
                        asynchronousService={asynchronousService}
                        authorizationService={authorizationService}
                        permissionService={permissionService}
                        facilityService={facilityService}
                    />
                ]}
            />
            <Modal
                isOpen={displayMappingModal}
                children={[
                    <AdminDhis2PeriodMappingForm
                        onSubmit={onSubmitMappingModal}
                        onCancel={toggleMappingModal}
                        serverId={serverId}
                    />
                ]}
            />
        </>
    );
};

export default AdminDhis2DatasetPage;
