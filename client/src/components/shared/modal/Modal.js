import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import InputType from '../Form/InputType';
import API from './../../../services/API';

const Modal = () => {
    const [inventoryType, setInventoryType] = useState("in");
    const [bloodGroup, setBloodGroup] = useState("");
    const [allowedBloodGroups, setAllowedBloodGroups] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [email, setEmail] = useState("");
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        if(email) {
            const apiEndpoint = inventoryType === "in" 
                ? `/inventory/get-blood-type?email=${email}` 
                : `/inventory/get-hospital-blood-group?email=${email}`;
            
            API.get(apiEndpoint)
                .then((response) => {
                    if(response.data.success) {
                        // If "out" allow multiple blood groups
                        setAllowedBloodGroups(
                            inventoryType === "out" ? response.data.bloodGroups : [response.data.bloodGroup]
                        );
                    } else {
                        alert(response.data.message);
                        setAllowedBloodGroups([]);
                    }
                })
                .catch((error) => {
                    console.error("Error in fetching data : ", error);
                });
        } else {
            setAllowedBloodGroups([]);
        }
    }, [email, inventoryType]);

    const handleModalSubmit = async () => {
        try {
            if (!bloodGroup || !quantity) {
                return alert("Please provide all required fields.");
            }

            const payload = {
                inventoryType,
                email,
                organization: user?._id,
                bloodGroup,
                quantity,
            };

            const { data } = await API.post('/inventory/create-inventory', payload);

            if (data?.success) {
                alert('New record created successfully.');
                window.location.reload();
            } else {
                alert(data.message || 'An error occurred.');
            }
        } catch (error) {
            console.error("Error in submitting inventory: ", error);
            alert(error.response?.data?.message || 'Submission failed.');
        }
    };

    return (
        <>
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">Manage Blood Record</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <div className='d-flex mb-3'>
                                Inventory Type: &nbsp;
                                <div className='form-check ms-3'>
                                    <input 
                                        type='radio' 
                                        name='inventoryRadio' 
                                        defaultChecked 
                                        value={'in'}
                                        onChange={(e) => setInventoryType(e.target.value)}
                                        className='form-check-input' 
                                    />
                                    <label htmlFor='in' className='form-check-label'>IN</label>
                                </div>
                                <div className='form-check ms-3'>
                                    <input 
                                        type='radio' 
                                        name='inventoryRadio' 
                                        value={'out'}
                                        onChange={(e) => setInventoryType(e.target.value)}
                                        className='form-check-input' 
                                    />
                                    <label htmlFor='out' className='form-check-label'>OUT</label>
                                </div>
                            </div>
                            <InputType 
                                labelText={inventoryType === 'in' ? 'Donor Email' : 'Hospital Email'} 
                                labelFor={'email'} 
                                inputType={'email'} 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={inventoryType === 'in' ? 'Enter donor email' : 'Enter hospital email'} 
                            />

                            <label htmlFor='bloodType'>Select Blood Type</label>
                            <select
                                className="form-select"
                                aria-label="Select blood type"
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                            >
                                <option value="">Select Blood Type</option>
                                    {allowedBloodGroups.map((group) => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>


                            <InputType 
                                labelText={'Quantity (ml)'} 
                                labelFor={'quantity'} 
                                inputType={'Number'} 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={"Quantity"} 
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleModalSubmit}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;

