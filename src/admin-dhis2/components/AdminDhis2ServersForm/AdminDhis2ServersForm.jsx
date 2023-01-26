import React, { useMemo } from 'react';

import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import { toast } from 'react-toastify';

import getService from '../../../react-components/utils/angular-utils';
import InputField from '../../../react-components/form-fields/input-field';
import AddButton from '../../../react-components/buttons/add-button';
import ResponsiveButton from '../../../react-components/buttons/responsive-button';

function AdminDhis2ServersForm({
    onSubmit, onCancel, 
    title, initialFormValue, 
    mode, refetch
}) {

  const validate = values => {
    const errors = { items: [] };

    values.items.forEach(item => {
        if (!item.name) {
            errors.items['name'] = { name: 'Required' };
        }

        if (!item.url) {
            errors.items['url'] = { quantity: 'Required' };
        }

        if (!item.username) {
            errors.items['username'] = { username: 'Required' };
        }

        if (!item.password) {
            errors.items['password'] = { password: 'Required' };
        }
    });

    return errors;
};

  const serverService = useMemo(
      () => {
          return getService('adminDhis2');
      },
      []
  );

  const addServer = (server) => {
      serverService.addServer(server).then(() => {
          onCancel();
          toast.success("Server added successfully!");
          refetch();
      })
      .catch((error) => {
          onCancel();
          toast.error(error);
      })
  }

  const editServer = (server) => {
    const requestServerData = server.items[0];
    const serverId = requestServerData.id;
    delete requestServerData.id;
    serverService.editServer(requestServerData, serverId).then(() => {
        onCancel();
        toast.success("Server saved successfully!");
        refetch();
    })
    .catch((error) => {
        onCancel();
        toast.error(error);
    })
  }

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
                                            <InputField
                                                required
                                                maxLength={50}
                                                numeric={false}
                                                name={`${name}.name`}
                                                label="Name"
                                                containerClass='field-full-width required'
                                            />
                                            <InputField
                                                required
                                                maxLength={100}
                                                numeric={false}
                                                name={`${name}.url`}
                                                label="Url"
                                                containerClass='field-full-width required'
                                            />
                                            <InputField
                                                required
                                                maxLength={50}
                                                numeric={false}
                                                name={`${name}.username`}
                                                label="Username"
                                                containerClass='field-full-width required'
                                            />
                                            <InputField
                                                required
                                                maxLength={50}
                                                numeric={false}
                                                type='password'
                                                name={`${name}.password`}
                                                label="Password"
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
                                            { mode === 'Add' ?
                                                <AddButton
                                                    className="primary"
                                                    disabled={invalid}
                                                    onClick={() => addServer(values)}
                                                >
                                                    Add
                                                </AddButton>
                                            :
                                                <ResponsiveButton
                                                    className="primary" 
                                                    disabled={invalid}
                                                    onClick={() => editServer(values)}
                                                >
                                                    Save
                                                </ResponsiveButton>
                                            }
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

export default AdminDhis2ServersForm;
