import React, { useMemo, useState, useEffect } from 'react';

import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import { SearchSelect } from '../../../requisition-order-create/search-select'
import {CRON_EXPRESSION_OPTIONS, WEEKLY_OPTIONS, DAY_OPTIONS, HOUR_OPTIONS, MINUTE_OPTIONS} from "../../consts";

function AdminDhis2DatasetForm({ onSubmit, onCancel, refetch, serverId }) {

    const [datasetOptions, setDatasetOptions] = useState([]);

    const [dhisDataset, setDhisDataset] = useState('');
    const [selectedDataset, setSelectedDataset] = useState("");
    const [selectedCronExpression, setSelectedCronExpression] = useState("");
    const [timeOffset, setTimeOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState('');
    const [hour, setHour] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const serverService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    const fetchDatasets = () => {
        if (serverId) {
            serverService?.getServerDatasetsList(serverId)
                .then((fetchedDatasets) => {
                    const {content} = fetchedDatasets;

                    const datasets = content.map((dataset) => ({
                        name: dataset.displayName,
                        value: dataset.displayName,
                        id: dataset.id
                    }));
                    setDatasetOptions(datasets);
                });
        }
    }

    useEffect(() => fetchDatasets(), [serverId]);

    const selectNumber = (value, countFrom = 0) => {

        const options = [];
        let n = countFrom;

        for (n; n <= value ; n++) {
            options.push({ name: `${n}`, value: n });
        }

        return options;
    }

    const selectDate = () => (
        <>
            {selectedCronExpression === CRON_EXPRESSION_OPTIONS[0].value &&
                <>
                    <span> on day </span>
                    <SearchSelect
                        options={selectNumber(DAY_OPTIONS, 1)}
                        value={selectedDay}
                        onChange={value => setSelectedDay(value)}
                        placeholder=''
                    />
                    <span> of month at </span>
                    <SearchSelect
                        options={selectNumber(HOUR_OPTIONS)}
                        value={hour}
                        onChange={value => setHour(value)}
                        placeholder=''
                    />
                    <span> : </span>
                    <SearchSelect
                        options={selectNumber(MINUTE_OPTIONS)}
                        value={minutes}
                        onChange={value => setMinutes(value)}
                        placeholder=''
                    />
                </>
            }
            {selectedCronExpression === 'WEEKLY' &&
                <>
                    <span> on </span>
                    <div className='date-section'>
                        <SearchSelect
                            options={WEEKLY_OPTIONS}
                            value={selectedDay}
                            onChange={value => setSelectedDay(value)}
                            placeholder='Select day'
                        />
                    </div>
                    <span> at </span>
                    <SearchSelect
                        options={selectNumber(HOUR_OPTIONS)}
                        value={hour}
                        onChange={value => setHour(value)}
                        placeholder=''
                    />
                    <span> : </span>
                    <SearchSelect
                        options={selectNumber(MINUTE_OPTIONS)}
                        value={minutes}
                        onChange={value => setMinutes(value)}
                        placeholder=''
                    />
                </>
            }
            {selectedCronExpression === 'DAILY' &&
                <>
                    <span> at </span>
                    <SearchSelect
                        options={selectNumber(HOUR_OPTIONS)}
                        value={hour}
                        onChange={value => setHour(value)}
                        placeholder=''
                    />
                    <span> : </span>
                    <SearchSelect
                        options={selectNumber(MINUTE_OPTIONS)}
                        value={minutes}
                        onChange={value => setMinutes(value)}
                        placeholder=''
                    />
                </>
            }
        </>
    )

    useEffect(() => {
        setDhisDataset(datasetOptions.find(dataset => dataset.name === selectedDataset));
    }, [selectedDataset])

    const resetSchedule = () => {
        setSelectedDay('');
        setHour(0);
        setMinutes(0);
    }

    const setInitialValues = () => {
        setSelectedDataset('');
        setSelectedCronExpression('');
        resetSchedule();
    }

    useEffect(() => {
        if (selectedCronExpression === CRON_EXPRESSION_OPTIONS[0].value
            || selectedCronExpression === CRON_EXPRESSION_OPTIONS[1].value) {
            const adjustedDay = selectedDay - 1;
            const onDay = 1440 * adjustedDay;
            const onTime = hour * 60 + minutes;
            setTimeOffset(onDay + onTime);
        }
        else if (selectedCronExpression === CRON_EXPRESSION_OPTIONS[2].value) {
            setTimeOffset(hour * 60 + minutes);
        }

    }, [selectedDay, hour, minutes, timeOffset])

    const submitDataElement = () => {

        const dataset = {
            name: selectedDataset,
            cronExpression: selectedCronExpression,
            serverDto: { id: serverId },
            dhisDatasetId: dhisDataset.id,
            timeOffset: timeOffset
        }

        serverService.addDataset(serverId, dataset)
            .then(() => {
                refetch();
                onSubmit();
                toast.success('Dataset has been added successfully!');
                setInitialValues();
            });
    }

    const isDaySelectable = !(selectedCronExpression === CRON_EXPRESSION_OPTIONS[2].value || selectedDay)

    const isSubmitButtonDisabled = !selectedDataset || !selectedCronExpression || isDaySelectable

  return (
      <div className="page-container">
          <div className="page-header-responsive">
              <h2>Add Dataset</h2>
          </div>
          <div className="page-content element-create-form">
              <div className='section field-full-width'>
                  <div><strong className="is-required">Dataset</strong></div>
                  <SearchSelect
                      options={CRON_EXPRESSION_OPTIONS}
                      value={selectedDataset}
                      onChange={value => setSelectedDataset(value)}
                      placeholder="Select dataset"
                  />
              </div>
              <div className='section field-full-width date-section'>
                  <div><strong className="is-required">Schedule</strong></div>
                  <SearchSelect
                      options={CRON_EXPRESSION_OPTIONS}
                      value={selectedCronExpression}
                      onChange={value => {
                          setSelectedCronExpression(value);
                          resetSchedule();
                      }}
                      placeholder="Select schedule"
                  />
                  <div className='time-section'>{selectDate()}</div>
              </div>
              <div className="bottom-bar">
                  <div>
                      <button
                          type="button"
                          className="secondary"
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
                          type="button"
                          disabled={isSubmitButtonDisabled}
                          onClick={() => submitDataElement()}
                      >
                         + Add
                      </button>
                  </div>
              </div>
          </div>
      </div>
);
}

export default AdminDhis2DatasetForm;
