import React, { useMemo, useEffect, useState } from 'react';

import getService from '../../../react-components/utils/angular-utils';

import { SearchSelect } from '../../../requisition-order-create/search-select'
import {SOURCE_OPTIONS} from '../../consts';

function AdminDhis2PeriodMappingForm({ onSubmit, onCancel }) {

    const [processingSchedulesOptions, setProcessingSchedulesOptions] = useState([]);

    const [selectedSource, setSelectedSource] = useState('');
    const [selectedDHIS2Period, setSelectedDHIS2Period] = useState('');
    const [selectedProcessingSchedule, setSelectedProcessingSchedule] = useState(undefined);

    const serverService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );
    
    const setInitialValues = () => {
        setSelectedSource('');
        setSelectedDHIS2Period('');
        setSelectedProcessingSchedule(undefined);
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

    useEffect(() => {
        fetchProcessingPeriods();
    }, []);

    const isSubmitButtonDisabled = !selectedSource || !selectedDHIS2Period || !selectedProcessingSchedule;

    return (
        <div className='page-container'>
          <div className='page-header-responsive'>
              <h2>Period Mapping</h2>
          </div>
          <div className='page-content element-create-form'>
            <div className='section'>
                <div><strong className='is-required'>Source</strong></div>
                  <SearchSelect
                      options={SOURCE_OPTIONS}
                      value={selectedSource}
                      onChange={value => setSelectedSource(value)}
                      placeholder='Select source'
                  />
                <div><strong className='is-required'>DHIS2 Period</strong></div>
                <SearchSelect
                    options={[]}
                    value={selectedDHIS2Period}
                    onChange={value => setSelectedDHIS2Period(value)}
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