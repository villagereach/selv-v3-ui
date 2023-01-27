import React, { useMemo } from 'react';

import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';

import getService from '../../../react-components/utils/angular-utils';
import SelectField from '../../../react-components/form-fields/select-field';
import AddButton from '../../../react-components/buttons/add-button';

function AdminDhis2DatasetForm({
    onSubmit, onCancel, 
    title, initialFormValue, 
    mode, refetch
}) {

  // TODO - here fetch from backend datasets that the DHIS2 user has access 
  const datasetOptions = [];  

  const validate = values => {
    const errors = { items: [] };

    return errors;
};

  const serverService = useMemo(
      () => {
          return getService('adminDhis2');
      },
      []
  );

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
                                            <SelectField
                                                required
                                                name={`${name}.dataset`}
                                                label="Dataset"
                                                options={datasetOptions}
                                                objectKey="id"
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
                                                onClick={() => {}}
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

export default AdminDhis2DatasetForm;
