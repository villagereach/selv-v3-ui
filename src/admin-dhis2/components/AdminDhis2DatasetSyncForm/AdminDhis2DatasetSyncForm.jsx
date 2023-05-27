import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import { SearchSelect } from '../../../requisition-order-create/search-select'

function AdminDhis2DatasetSyncForm({ 
    onSubmit,
    onCancel, 
    serverId, 
    datasetId,
    asynchronousService,
    authorizationService,
    permissionService,
    facilityService 
    }) {

    const [dhisPermissionsFacilitiesOptions, setDhisPermissionsFacilitiesOptions] = useState([]);
    const [dhisPeriodMappingsOptions, setDdhisPeriodMappingsOptions] = useState([]);

    const [selectedFacility, setSelectedFacility] = useState('');
    const [selectedPeriodMapping, setSelectedPeriodMapping] = useState('');

    const serverService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    const setInitialValues = () => {
        setSelectedFacility('');
        setSelectedPeriodMapping('');
    }

    const fetchDhisPeriodMappings = () => {
        if (serverId) {
            serverService?.getPeriodMappings(serverId)
            .then((fetchedDhisPeriodMappings) => {
                const { content } = fetchedDhisPeriodMappings;

                const dhisPeriodMappings = content.map((dhisPeriodMapping) => ({
                    name: dhisPeriodMapping.name,
                    value: dhisPeriodMapping.id,
                }));

                setDdhisPeriodMappingsOptions(dhisPeriodMappings);
            });
        }
    }

    const fetchDhisFacilities = () => {
        const userId = authorizationService.getUser().user_id;
        asynchronousService.all([
            facilityService.getAllMinimal(),
            permissionService.load(userId),
        ])
            .then((responses) => {
                const [facilities, permissions] = responses;

                const dhisPermissionsFacilities = permissions
                    .filter((permission) => permission.right === 'MANAGE_DHIS2_SUPERVISORY_NODES')
                    .map((permission) => {
                        return {
                            id: permission.facilityId,
                            name: facilities.find((facility) => facility.id === permission.facilityId).name
                        }
                    });

                const dhisFacilitiesOptions = dhisPermissionsFacilities.map((dhisFacility) => ({
                    name: dhisFacility.name,
                    value: dhisFacility.id
                }))

                setDhisPermissionsFacilitiesOptions(dhisFacilitiesOptions);
            });
    }

    useEffect(() => {
        fetchDhisPeriodMappings();
        fetchDhisFacilities();
    }, [serverId]);

    useEffect(() => {}, [datasetId])

    const submitDatasetSync = () => {
        const syncPayload = {
            facilityCodes: [
                selectedFacility
            ]
        }

        serverService.syncServer(serverId, datasetId, selectedPeriodMapping, syncPayload)
            .then(() => {
                onSubmit();
                toast.success('Data has been synchronized successfully!');
                setInitialValues();
            });
    }

    const isSubmitButtonDisabled = !selectedFacility || !selectedPeriodMapping;

    return (
        <div className='page-container'>
          <div className='page-header-responsive'>
              <h2>Synchronization Parameteres</h2>
          </div>
          <div className='page-content element-create-form'>
            <div className='section field-full-width'>
                  <div><strong className='is-required'>Facility</strong></div>
                  <SearchSelect
                      options={dhisPermissionsFacilitiesOptions}
                      value={selectedFacility}
                      onChange={value => setSelectedFacility(value)}
                      placeholder='Select facility'
                  />
              </div>
              <div className='section field-full-width'>
                  <div><strong className='is-required'>Period</strong></div>
                  <SearchSelect
                      options={dhisPeriodMappingsOptions}
                      value={selectedPeriodMapping}
                      onChange={value => setSelectedPeriodMapping(value)}
                      placeholder='Select period'
                  />
              </div>
              <div className='bottom-bar'>
                  <div>
                      <button
                          type='button'
                          className='secondary'
                          onClick={() => {
                              onCancel();
                              setInitialValues();
                          }}
                      >
                          <span>Cancel</span>
                      </button>
                  </div>
                  <div>
                      <button
                          className={`primary ${isSubmitButtonDisabled && 'disabled-button'}`}
                          type='button'
                          disabled={isSubmitButtonDisabled}
                          onClick={submitDatasetSync}
                      >
                         Sync
                      </button>
                  </div>
              </div>
          </div>
      </div>
    );
}

export default AdminDhis2DatasetSyncForm;
