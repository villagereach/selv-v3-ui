import React, { useState } from 'react';

import { SearchSelect } from '../../../requisition-order-create/search-select'

function AdminDhis2DatasetSyncForm({ onSubmit, onCancel }) {

    const [selectedFacility, setSelectedFacility] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');

    const setInitialValues = () => {
        setSelectedFacility('');
        setSelectedPeriod('');
    }

    const isSubmitButtonDisabled = !selectedFacility || !selectedPeriod;

    return (
        <div className='page-container'>
          <div className='page-header-responsive'>
              <h2>Synchronization Parameteres</h2>
          </div>
          <div className='page-content element-create-form'>
            <div className='section field-full-width'>
                  <div><strong className='is-required'>Facility</strong></div>
                  <SearchSelect
                    //   options={datasetOptions}
                    options={[]}
                      value={selectedFacility}
                      onChange={value => setSelectedFacility(value)}
                      placeholder='Select facility'
                  />
              </div>
              <div className='section field-full-width'>
                  <div><strong className='is-required'>Period</strong></div>
                  <SearchSelect
                    options={[]}
                    //   options={datasetOptions}
                      value={selectedPeriod}
                      onChange={value => setSelectedPeriod(value)}
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
