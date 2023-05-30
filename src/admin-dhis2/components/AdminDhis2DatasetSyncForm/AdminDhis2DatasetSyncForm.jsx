import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import { SYNC_OPTIONS } from '../../consts';
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
        const params = {
            size: -1,
            sort: 'name,asc'
        };

        asynchronousService.all([
            facilityService.search(params, params),
            permissionService.load(userId),
        ])
            .then((responses) => {
                const [facilities, permissions] = responses;

                const dhisPermissionsFacilities = permissions
                    .filter((permission) => permission.right === 'MANAGE_DHIS2_SUPERVISORY_NODES')
                    .map((permission) => {
                        const permissionFacility = facilities.content.find((facility) => facility.id === permission.facilityId);
                        return {
                            name: permissionFacility.name,
                            code: permissionFacility.code
                        }
                    });

                const dhisFacilitiesOptions = dhisPermissionsFacilities.map((dhisFacility) => ({
                    name: dhisFacility.name,
                    value: dhisFacility.code
                }))

                dhisFacilitiesOptions.length > 0 && 
                    setDhisPermissionsFacilitiesOptions([...SYNC_OPTIONS, ...dhisFacilitiesOptions]);
            });
    }

    useEffect(() => {
        fetchDhisPeriodMappings();
        fetchDhisFacilities();
    }, [serverId]);

    useEffect(() => {}, [datasetId])

    const submitDatasetSync = () => {

        let facilityCodes = [];

        if (selectedFacility === 'Select All') {

            const allFacilities = dhisPermissionsFacilitiesOptions
            .filter((facilityOption) => facilityOption.value !== 'Select All')
            .map((facilityOption) => facilityOption.value)

            facilityCodes = allFacilities;
        }

        const syncPayload = {
            facilityCodes: facilityCodes.length === 0 ?  [
                selectedFacility
            ] : facilityCodes
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
                          onClick={() => submitDatasetSync()}
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
