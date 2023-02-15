import React, { useMemo, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import { SearchSelect } from '../../../requisition-order-create/search-select'

function AdminDhis2DataElementForm({ onSubmit, onCancel, refetch, serverId, datasetId }) {

    const indicatorTypeOptions = [
        {name: 'Stock Management', value: 'Stock Management'},
        {name: 'Requisition', value: 'Requisition'}
    ];

    const indicatorOptions = [
        {name: 'Opening Balance', value: 'Opening Balance'},
        {name: 'Received', value: 'Received'},
        {name: 'Closing Balance', value: 'Closing Balance'},
        {name: 'Total Negative Adjustments', value: 'Total Negative Adjustments'},
        {name: 'Total Positive Adjustments', value: 'Total Positive Adjustments'}
    ];

    const [productOptions, setProductOptions] = useState([]);

    const [providedName, setProvidedName] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedIndicator, setSelectedIndicator] = useState("");
    const [selectedIndicatorType, setSelectedIndicatorType] = useState("");

    const setInitialValues = () => {
        setProvidedName('');
        setSelectedProduct('');
        setSelectedIndicator('');
        setSelectedIndicatorType('');
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

    useEffect(() => {
        fetchDataOrderables();
    }, [])

    const submitDataElement = () => {
        const element = {
            name: providedName,
            source: selectedIndicatorType,
            indicator: selectedIndicator,
            orderable: selectedProduct,
            element: `${selectedIndicator} - ${selectedProduct}`
        }

        serverService.addDataElement(serverId, datasetId, element)
            .then(() => {
                refetch();
                onSubmit();
                toast.success('Data Element has been added successfully!');
                setInitialValues();
            });
    }

    return (
        <div className="page-container">
            <div className="page-header-responsive">
                <h2>Add Data Element Mapping</h2>
            </div>
            <div className="page-content element-create-form">
                <div className='section field-full-width'>
                    <div><strong className="is-required">Name</strong></div>
                    <input
                        className='text-field'
                        value={providedName}
                        onInput={e => setProvidedName(e.target.value)}
                    />
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
                <div className="bottom-bar">
                    <div>
                        <button
                        type="button"
                        className="secondary"
                        onClick={onCancel}
                        >
                            <span>Cancel</span>
                        </button>
                    </div>
                    <div>
                        <button
                        className="primary"
                        type="button"
                        disabled={!selectedProduct || !selectedIndicator || !selectedIndicatorType || !providedName}
                        onClick={() => submitDataElement()}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDhis2DataElementForm;