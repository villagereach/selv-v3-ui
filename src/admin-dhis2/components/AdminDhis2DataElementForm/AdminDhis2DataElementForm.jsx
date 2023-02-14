import React, { useMemo, useEffect, useState } from 'react';

import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';

import getService from '../../../react-components/utils/angular-utils';
import InputField from '../../../react-components/form-fields/input-field';
import SelectField from '../../../react-components/form-fields/select-field';
import AddButton from '../../../react-components/buttons/add-button';

function AdminDhis2DataElementForm({onSubmit, onCancel, title, initialFormValue, mode, refetch}) {

    const indicatorTypeOptions = [
        {name: 'Stock Management', values: 'Stock Management'},
        {name: 'Requisition', values: 'Requisition'}
    ];
    const indicatorOptions = [];

    const [product, setProduct] = useState("")
    const [productOptions, setProductOptions] = useState();

    const validate = values => {
        const errors = { items: [] };

        console.log(values, errors)

        return errors;
    };

    const serverService = useMemo(
        () => {
            return getService('adminDhis2');
        },
        []
    );

    const fetchDataOrderables = () => {
        serverService.getDataOrderables()
            .then((fetchedOrderables) => {
                const { content } = fetchedOrderables

                const elements = content.map((element) => ({
                    name: element.fullProductName,
                    value: element.id
                }));
                setProductOptions(elements);

            });
    }

    console.log(productOptions)

    useEffect(() => {
        fetchDataOrderables()
    }, [])

    return (
        <div style={{marginBottom: "40px"}}>
            <Form
                initialValues={{ items: initialFormValue }}
                onSubmit={onSubmit}
                validate={validate}
                mutators={{ ...arrayMutators }}
                render={({ handleSubmit, values, invalid }) => (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <FieldArray name="items">
                            {({ fields }) => (
                                <div className="form-container">
                                    <div className="page-header-responsive">
                                        <div id="header-wrap" style={{marginBottom: "24px"}}>
                                            <h2 id="product-add-header">
                                                {title}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="form-body">
                                        {fields.map((name, index) => (
                                            <div key={name}>
                                                {console.log(name, index)}
                                                <InputField
                                                    required
                                                    maxLength={50}
                                                    numeric={false}
                                                    name={`${name}.name`}
                                                    label="Name"
                                                    containerClass='field-full-width required'
                                                />
                                                <SelectField
                                                    required
                                                    name={`${name}.indicatorType`}
                                                    label="Indicator Type"
                                                    options={indicatorTypeOptions}
                                                    objectKey="indicatorType"
                                                    containerClass='field-full-width required'
                                                />
                                                <SelectField
                                                    required
                                                    name={`${name}.indicator`}
                                                    label="Indicator"
                                                    options={indicatorOptions}
                                                    objectKey="dataElementIndicator"
                                                    containerClass='field-full-width required'
                                                />
                                                <SelectField
                                                    required
                                                    name={`${name}.product`}
                                                    label="Product"
                                                    options={productOptions}
                                                    objectKey='product'
                                                    containerClass='field-full-width required'
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="navbar">
                                        <div id='navbar-wrap'>
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
                                                <AddButton
                                                    className="primary"
                                                    disabled={invalid}
                                                    onClick={() => console.log(values)}
                                                >
                                                    Add
                                                </AddButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FieldArray>
                    </form>
                )}
            />
        </div>
    );
}

export default AdminDhis2DataElementForm;
