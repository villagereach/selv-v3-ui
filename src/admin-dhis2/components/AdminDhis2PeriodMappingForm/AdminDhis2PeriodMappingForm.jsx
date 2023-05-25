import React, { useMemo, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import { SearchSelect } from '../../../requisition-order-create/search-select'
import {SOURCE_OPTIONS} from '../../consts';

function AdminDhis2PeriodMappingForm({ onSubmit, onCancel, serverId }) {

    const [processingSchedulesOptions, setProcessingSchedulesOptions] = useState([]);
    const [dhisPeriodTypesOptions, setDhisPeriodTypesOptions] = useState([]);

    const [providedName, setProvidedName] = useState('');
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedDhisPeriodType, setSelectedDhisPeriodType] = useState('');
    const [selectedProcessingSchedule, setSelectedProcessingSchedule] = useState(undefined);
    const [errors, setErrors] = useState([]);

    const serverService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    const setInitialValues = () => {
        setProvidedName('');
        setSelectedSource('');
        setSelectedDhisPeriodType('');
        setSelectedProcessingSchedule(undefined);
        setErrors([]);
    };

    const fetchProcessingPeriods = () => {
        serverService.getProcessingSchedules()
            .then((fetchedProcessingPeriods) => {
                const { content } = fetchedProcessingPeriods;

                const elements = content.map((element) => ({
                    name: element.name,
                    value: element.id,
                    startDate: element.startDate,
                    endDate: element.endDate
                }));
                setProcessingSchedulesOptions(elements);
            });
    }

    const fetchDhisPeriodTypes = () => {
        if (serverId) {
            serverService?.getDhisPeriodTypes(serverId)
            .then((fetchedDhisPeriodTypes) => {

                const dhisPeriodTypes = fetchedDhisPeriodTypes.map((dhisPeriodType) => ({
                    name: dhisPeriodType.name,
                    value: dhisPeriodType.name,
                }));
                setDhisPeriodTypesOptions(dhisPeriodTypes);
            });
        }
    }

    const submitPeriodMapping = () => {
        const periodMapping = {
            name: providedName,
            dhisPeriod: selectedDhisPeriodType,
            source: selectedSource,
            processingPeriodId: selectedProcessingSchedule.value,
            startDate: selectedProcessingSchedule.startDate,
            endDate: selectedProcessingSchedule.endDate,
            serverDto: {
                id: serverId
            }
        }

        serverService.addPeriodMapping(serverId, periodMapping)
            .then(() => {
                onSubmit();
                toast.success('Period Mapping has been added successfully!');
                setInitialValues();
            });
    }

    useEffect(() => fetchDhisPeriodTypes(), [serverId]);

    useEffect(() => {
        fetchProcessingPeriods();
        fetchDhisPeriodTypes();
    }, []);
    
    const nameValidation = (name) => {
        const pattern = /^[^-\s]([0-9a-zA-Z\s]){2,50}\s*$/g;

        if (name.length < 3) {

            setErrors(errors => [...errors, 'Name should contain at least 3 characters']);

            return
        }

        if (!pattern.test(name)) {
            setErrors(errors => [...errors, 'Invalid name']);
        }

    }

    const isSubmitButtonDisabled = !selectedSource ||
     !selectedDhisPeriodType || 
     !selectedProcessingSchedule ||
     !providedName ||
     errors.length > 0;

    return (
        <div className='page-container'>
          <div className='page-header-responsive'>
              <h2>Map Periods</h2>
          </div>
          <div className='page-content element-create-form'>
            <div className='section'>
                <div><strong className='is-required'>Name</strong></div>
                <div className='field-full-width'>
                    <div className={`${errors.length > 0 && 'exclamation-mark'}`}>
                        <input
                            className={`text-field ${errors.length > 0 && 'invalid-field'}`}
                            value={providedName}
                            maxLength={50}
                            onInput={e => setProvidedName(e.target.value)}
                            onKeyUp={() => {
                                setErrors([]);
                                nameValidation(providedName);
                            }}
                        />
                    </div>
                </div>
                {errors.map((error, key) => <p key={key} className='invalid-name'>{error}</p>)}
                <div><strong className='is-required'>Source</strong></div>
                  <SearchSelect
                      options={SOURCE_OPTIONS}
                      value={selectedSource}
                      onChange={value => setSelectedSource(value)}
                      placeholder='Select source'
                  />
                <div><strong className='is-required'>DHIS2 Period</strong></div>
                <SearchSelect
                    options={dhisPeriodTypesOptions}
                    value={selectedDhisPeriodType}
                    onChange={value => setSelectedDhisPeriodType(value)}
                    placeholder='Select period'
                />
                <div><strong className='is-required'>Processing Schedule</strong></div>
                <SearchSelect
                    options={processingSchedulesOptions}
                    value={selectedProcessingSchedule}
                    onChange={value => setSelectedProcessingSchedule(processingSchedulesOptions.find((processingSchedule) => processingSchedule.value === value))}
                    placeholder='Select processing schedule'
                />
                <div><strong>Start Date</strong></div>
                <div className='input-control openlmis-datepicker'>
                <input
                    type='text'
                    name='startDate'
                    disabled
                    value={selectedProcessingSchedule !== undefined ? selectedProcessingSchedule.startDate : ''}
                />
                </div>
                <div><strong>End Date</strong></div>
                <div className='input-control openlmis-datepicker'>
                <input
                    type='text'
                    name='endDate'
                    disabled
                    value={selectedProcessingSchedule !== undefined ? selectedProcessingSchedule.endDate : ''}
                />
                </div>
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
                          onClick={() => submitPeriodMapping()}
                      >
                         Map
                      </button>
                  </div>
              </div>
          </div>
      </div>
    );
}

export default AdminDhis2PeriodMappingForm;
