import React, { useMemo, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import { SearchSelect } from '../../../requisition-order-create/search-select'
import {SOURCE_OPTIONS} from '../../consts';

function AdminDhis2PeriodMappingForm({ onSubmit, onCancel, serverId, datasetId }) {

    const [processingPeriods, setProcessingPeriods] = useState([]);
    const [processingPeriodsOptions, setProcessingPeriodsOptions] = useState([]);
    const [processingSchedulesOptions, setProcessingSchedulesOptions] = useState([]);

    const [providedName, setProvidedName] = useState('');
    const [selectedSource, setSelectedSource] = useState('');
    const [dhisPeriod, setDhisPeriod] = useState('');
    const [selectedProcessingPeriod, setSelectedProcessingPeriod] = useState(undefined);
    const [selectedProcessingSchedule, setSelectedProcessingSchedule] = useState(undefined);
    const [errors, setErrors] = useState([]);

    const numberOfPeriodsToDisplay = 4;

    const serverService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    const setInitialValues = () => {
        setProvidedName('');
        setSelectedSource('');
        setSelectedProcessingPeriod(undefined);
        setSelectedProcessingSchedule(undefined);
        setErrors([]);
    };

    const fetchDhisPeriodMappings = () => {
        if (serverId) {
            serverService?.getPeriodMappings(serverId, datasetId)
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

    const fetchServerDataset = () => {
        serverService.getServerDataset(serverId, datasetId)
            .then((fetchedServerDataset) => {
                setDhisPeriod(fetchedServerDataset.periodType);
            })
    }

    const fetchProcessingSchedules = () => {
        serverService.getProcessingSchedules()
            .then((fetchedProcessingSchedules) => {
                const { content } = fetchedProcessingSchedules;
                
                const elements = content.map((element) => ({
                    name: element.name,
                    value: element.id
                }));

                setProcessingSchedulesOptions(elements);
            });
    }

    const fetchProcessingPeriods = () => {
        serverService.getProcessingPeriods()
            .then((fetchedProcessingPeriods) => {
                const { content } = fetchedProcessingPeriods;
                setProcessingPeriods(content);
            });
    }

    const filterProcessingPeriodsBySchedule = (scheduleId) => {
        const processingPeriodsWithScheduleId = processingPeriods
            .filter((processingPeriod) => processingPeriod.processingSchedule.id === scheduleId)
            .map((processingPeriod) => ({
                name: processingPeriod.name,
                value: processingPeriod.id,
                startDate: processingPeriod.startDate,
                endDate: processingPeriod.endDate,
                processingScheduleId: processingPeriod.processingSchedule.id
            }))
            .slice(0,numberOfPeriodsToDisplay);

        setProcessingPeriodsOptions(processingPeriodsWithScheduleId);
    }

    const submitPeriodMapping = () => {
        const periodMapping = {
            name: providedName,
            dhisPeriod: dhisPeriod,
            source: selectedSource,
            processingPeriodId: selectedProcessingPeriod.value,
            startDate: selectedProcessingPeriod.startDate,
            endDate: selectedProcessingPeriod.endDate,
            datasetDto: {
                id: datasetId,
                serverDto: {
                    id: serverId
                }
            }
        }

        serverService.addPeriodMapping(serverId, datasetId, periodMapping)
            .then(() => {
                fetchDhisPeriodMappings();
                onSubmit();
                toast.success('Period Mapping has been added successfully!');
                setInitialValues();
            });
    }

    useEffect(() => fetchServerDataset(), [datasetId]);

    useEffect(() => {
        fetchProcessingPeriods();
        fetchServerDataset();
        fetchProcessingSchedules();
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
     !dhisPeriod || 
     !selectedProcessingPeriod ||
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
                <div className='field-full-width'>
                    <div>
                        <input
                            value={dhisPeriod}
                            disabled
                        />
                    </div>
                </div>
                <div><strong className='is-required'>Processing Schedule</strong></div>
                <SearchSelect
                    options={processingSchedulesOptions}
                    value={selectedProcessingSchedule}
                    onChange={(value) => {
                        setSelectedProcessingSchedule(value);
                        filterProcessingPeriodsBySchedule(value);
                        setSelectedProcessingPeriod(undefined);
                    }}
                    placeholder='Select processing schedule'
                />
                <div><strong className='is-required'>Processing Period</strong></div>
                <SearchSelect
                    disabled={!selectedProcessingSchedule}
                    options={processingPeriodsOptions}
                    value={selectedProcessingPeriod}
                    onChange={value => setSelectedProcessingPeriod(processingPeriodsOptions.find((processingPeriod) => processingPeriod.value === value))}
                    placeholder='Select processing period'
                />
                <div><strong>Start Date</strong></div>
                <div className='input-control openlmis-datepicker'>
                <input
                    type='text'
                    name='startDate'
                    disabled
                    value={selectedProcessingPeriod !== undefined ? selectedProcessingPeriod.startDate : ''}
                />
                </div>
                <div><strong>End Date</strong></div>
                <div className='input-control openlmis-datepicker'>
                <input
                    type='text'
                    name='endDate'
                    disabled
                    value={selectedProcessingPeriod !== undefined ? selectedProcessingPeriod.endDate : ''}
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
