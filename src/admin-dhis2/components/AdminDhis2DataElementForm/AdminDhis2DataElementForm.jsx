import React, { useMemo, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import { SearchSelect } from '../../../requisition-order-create/search-select'

function AdminDhis2DataElementForm({ onSubmit, onCancel, refetch, serverId, datasetId, dataElementsParams }) {

    const indicatorTypeOptions = [
        {name: 'Requisition', value: 'Requisition'}
    ];

    const indicatorOptions = [
        {name: 'Opening Balance', value: 'Opening Balance'},
        {name: 'Received', value: 'Received'},
        {name: 'Closing Balance', value: 'Closing Balance'},
        {name: 'Negative Adjustments', value: 'Negative Adjustments'},
        {name: 'Positive Adjustments', value: 'Positive Adjustments'}
    ];

    const [productOptions, setProductOptions] = useState([]);
    const [dataElementsOptions, setDataElementsOptions] = useState([]);

    const [providedName, setProvidedName] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedIndicator, setSelectedIndicator] = useState("");
    const [selectedIndicatorType, setSelectedIndicatorType] = useState("");
    const [selectedDataElement, setSelectedDataElement] = useState("");
    const [errors, setErrors] = useState([]);

    const setInitialValues = () => {
        setProvidedName('');
        setSelectedProduct('');
        setSelectedIndicator('');
        setSelectedIndicatorType('');
        setErrors([]);
    }

    const serverService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    const fetchDataOrderables = () => {
        serverService.getDataOrderables()
            .then((fetchedOrderables) => {
                const { content } = fetchedOrderables;

                const elements = content.map((element) => ({
                    name: element.fullProductName,
                    value: element.fullProductName
                }));
                setProductOptions(elements);

            });
    }

    const fetchDataElements = () => {
        if (datasetId) {
            serverService.getDhisElements(serverId, datasetId)
                .then((fetchedDhisElements) => {
                    const {content} = fetchedDhisElements;

                    const elements = content.map((element) => ({
                        name: element.name,
                        value: element.name
                    }));
                    setDataElementsOptions(elements);

                });
        }
    }

    useEffect(() => {
        fetchDataOrderables();
        fetchDataElements();
    }, [datasetId])

    const submitDataElement = () => {
        const element = {
            name: providedName,
            source: selectedIndicatorType,
            indicator: selectedIndicator,
            orderable: selectedProduct,
            element: selectedDataElement
        }

        serverService.addDataElement(serverId, datasetId, element)
            .then(() => {
                refetch();
                onSubmit();
                toast.success('Data Element has been added successfully!');
                setInitialValues();
            });
    }

    const nameValidation = (name) => {
        const pattern = /^[^-\s]([0-9a-zA-Z\s]){2,50}\s*$/g;

        if (name.length < 3) {

            setErrors(errors => [...errors, 'Name should contain at least 3 characters']);

            return
        }

        if (!pattern.test(name)) {
            setErrors(errors => [...errors, 'Invalid name']);
        }

        if (dataElementsParams.find(element => element.dataElementName === name)) {
            setErrors(errors => [...errors, 'Data element with given name already exist']);
        }

    }

    const isSubmitButtonDisabled = !selectedProduct ||
        !selectedIndicator ||
        !selectedIndicatorType ||
        !providedName ||
        errors.length > 0

    return (
        <div className="page-container">
            <div className="page-header-responsive">
                <h2>Add Data Element Mapping</h2>
            </div>
            <div className="page-content element-create-form">
                <div className='section field-full-width'>
                    <div><strong className="is-required">Name</strong></div>
                    <div>
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
                </div>
                <div className='section field-full-width'>
                    <div><strong className="is-required">Indicator Type</strong></div>
                    <SearchSelect
                        options={indicatorTypeOptions}
                        value={selectedIndicatorType}
                        onChange={value => setSelectedIndicatorType(value)}
                        placeholder="Select indicator type"
                    />
                </div>
                <div className='section'>
                    <div><strong className="is-required">Indicator</strong></div>
                    <SearchSelect
                        options={indicatorOptions}
                        value={selectedIndicator}
                        onChange={value => setSelectedIndicator(value)}
                        placeholder="Select indicator"
                    />
                </div>
                <div className='section field-full-width'>
                    <div><strong className="is-required">Product</strong></div>
                    <SearchSelect
                        options={productOptions}
                        value={selectedProduct}
                        onChange={value => setSelectedProduct(value)}
                        placeholder="Select product"
                    />
                </div>
                <div className='section field-full-width'>
                    <div><strong className="is-required">Data Element</strong></div>
                    <SearchSelect
                        options={dataElementsOptions}
                        value={selectedDataElement}
                        onChange={value => setSelectedDataElement(value)}
                        placeholder="Select data element"
                    />
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

export default AdminDhis2DataElementForm;
