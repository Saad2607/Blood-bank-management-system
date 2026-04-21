import React, { useState } from 'react';
import InputType from './InputType';
import { Link } from 'react-router-dom';
import { handleLogin, handleRegister } from '../../../services/authService';

const Form = ({ formType, submitBtn, formTitle }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('donar');
    const [bloodGroup, setBloodGroup] = useState('');
    const [name, setName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const handlePhoneChange = (e) => {
        const phoneValue = e.target.value;
        setPhone(phoneValue);

        // Validate if phone number has exactly 10 digits
        if (!/^\d{10}$/.test(phoneValue)) {
            setPhoneError('Phone number must be 10 digits.');
        } else {
            setPhoneError('');
        }
    };
    return (
        <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (formType === 'register' && phoneError) {
                    alert('Please enter a valid phone number.');
                    return;
                }

                if (formType === 'login') return handleLogin(e, email, password, role);
                else if (formType === 'register') return handleRegister(e, name, role, email, password, bloodGroup, phone, organizationName, address, hospitalName, website);
            }}>
                <h1 className='text-center'>{formTitle}</h1>
                <hr />
                <div className='radio-container'>
                    <div className='d-flex mb-3'>
                        <div className='form-check'>
                            <input
                                type='radio'
                                className='form-check-input'
                                name='role'
                                id='donarRadio'
                                value={'donar'}
                                onChange={(e) => setRole(e.target.value)}
                                defaultChecked
                            />
                            <label htmlFor='donarRadio' className='form-check-label'>
                                Donar
                            </label>
                        </div>

                        <div className='form-check ms-2'>
                            <input
                                type='radio'
                                className='form-check-input'
                                name='role'
                                id='adminRadio'
                                value={'admin'}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label htmlFor='adminRadio' className='form-check-label'>
                                Admin
                            </label>
                        </div>

                        <div className='form-check ms-2'>
                            <input
                                type='radio'
                                className='form-check-input'
                                name='role'
                                id='hospitalRadio'
                                value={'hospital'}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label htmlFor='hospitalRadio' className='form-check-label'>
                                Hospital
                            </label>
                        </div>

                        <div className='form-check ms-2'>
                            <input
                                type='radio'
                                className='form-check-input'
                                name='role'
                                id='organizationRadio'
                                value={'organization'}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label htmlFor='organizationRadio' className='form-check-label'>
                                Organization
                            </label>
                        </div>
                    </div>
                </div>
                {/* switch statement */}
                {(() => {
                    switch (true) {
                        case formType === 'login': {
                            return (
                                <>
                                    <InputType
                                        labelText={'Email'}
                                        labelFor={'forEmail'}
                                        inputType={'email'}
                                        name={'email'}
                                        placeholder={'Email'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />

                                    <InputType
                                        labelText={'Password'}
                                        labelFor={'forPassword'}
                                        inputType={'password'}
                                        name={'password'}
                                        placeholder={'Password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </>
                            );
                        }
                        case formType === 'register': {
                            return (
                                <>
                                    {(role === 'admin' || role === 'donar') && (
                                        <InputType
                                            labelText={'Name'}
                                            labelFor={'forName'}
                                            inputType={'text'}
                                            name={'name'}
                                            placeholder={'Name'}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    )}

                                    {role === 'organization' && (
                                        <InputType
                                            labelText={'Organization Name'}
                                            labelFor={'forOrganizationName'}
                                            inputType={'text'}
                                            name={'organizationName'}
                                            placeholder={'Organization Name'}
                                            value={organizationName}
                                            onChange={(e) => setOrganizationName(e.target.value)}
                                        />
                                    )}

                                    {role === 'hospital' && (
                                        <InputType
                                            labelText={'Hospital Name'}
                                            labelFor={'forHospitalName'}
                                            inputType={'text'}
                                            name={'hospitalName'}
                                            placeholder={'Hospital Name'}
                                            value={hospitalName}
                                            onChange={(e) => setHospitalName(e.target.value)}
                                        />
                                    )}

                                    <InputType
                                        labelText={'Email'}
                                        labelFor={'forEmail'}
                                        inputType={'email'}
                                        name={'email'}
                                        placeholder={'Email'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />

                                    {role === 'donar' && (
                                        <>
                                            <label htmlFor="forBloodGroup" className="form-label">Blood Group</label>
                                            <select
                                                className="form-select"
                                                aria-label="Default select example"
                                                onChange={(e) => setBloodGroup(e.target.value)}
                                            >
                                                <option defaultValue={'Select Blood Group'}>Select Blood Group</option>
                                                <option value={'O+'}>O+</option>
                                                <option value={'O-'}>O-</option>
                                                <option value={'AB+'}>AB+</option>
                                                <option value={'AB-'}>AB-</option>
                                                <option value={'A+'}>A+</option>
                                                <option value={'A-'}>A-</option>
                                                <option value={'B+'}>B+</option>
                                                <option value={'B-'}>B-</option>
                                            </select>
                                        </>
                                    )}

                                    <InputType
                                        labelText={'Password'}
                                        labelFor={'forPassword'}
                                        inputType={'password'}
                                        name={'password'}
                                        placeholder={'Password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    {(role === 'hospital' || role === 'organization') && (
                                        <InputType
                                            labelText={'Website'}
                                            labelFor={'forWebsite'}
                                            inputType={'text'}
                                            name={'website'}
                                            placeholder={'Website'}
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    )}

                                    {(role !== 'donar') && (
                                        <InputType
                                            labelText={'Address'}
                                            labelFor={'forAddress'}
                                            inputType={'text'}
                                            name={'address'}
                                            placeholder={'Address'}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    )}

                                    {(role === 'donar') && (
                                        <>
                                            <label htmlFor="forBloodGroup" className="form-label">Diseases</label>
                                            <select
                                                className="form-select"
                                                aria-label="Default select example"
                                                onChange={(e) => setAddress(e.target.value)}
                                            >
                                                <option defaultValue={'Diseases'}>Select Diseases</option>
                                                <option value={'HIV/AIDS or positive test for HIV.'}>HIV/AIDS or positive test for HIV.</option>
                                                <option value={'Hepatitis B or C.'}>Hepatitis B or C.</option>
                                                <option value={'Heart disease (serious conditions).'}>Heart disease (serious conditions).</option>
                                                <option value={'Cancer (except some localized skin cancers).'}>Cancer (except some localized skin cancers).</option>
                                                <option value={'Blood disorders (e.g., hemophilia).'}>Blood disorders (e.g., hemophilia).</option>
                                                <option value={'Creutzfeldt-Jakob Disease (CJD) or related conditions.'}>Creutzfeldt-Jakob Disease (CJD) or related conditions.</option>
                                                <option value={'Use of certain medications, e.g., etretinate (for psoriasis) or certain chemotherapy drugs.'}>Use of certain medications, e.g., etretinate (for psoriasis) or certain chemotherapy drugs.</option>
                                                <option value={'None'}>None</option>
                                            </select>
                                        </>
                                    )}

                                    <InputType
                                        labelText={'Phone Number'}
                                        labelFor={'forPhone'}
                                        inputType={'text'}
                                        name={'phone'}
                                        placeholder={'Phone Number'}
                                        value={phone}
                                        maxLength={10}
                                        onChange={handlePhoneChange}
                                    />
                                    {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>}
                                </>
                            );
                        }
                    }
                })()}

                <div className='d-flex flex-column justify-content-between'>
                    {formType === 'login' ? (
                        <p>Not registered yet ? Register
                            <Link to="/register"> Here !</Link>
                        </p>
                    ) : (
                        <p>Already User Please
                            <Link to="/login"> Login !</Link>
                        </p>
                    )}
                    <button className='btn btn-primary bg-white text-black' type='submit'>
                        {submitBtn}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Form;
