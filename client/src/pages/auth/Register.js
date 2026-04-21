import React from 'react';
import Form from '../../components/shared/Form/Form';
import { useSelector } from 'react-redux';
import Spinner from '../../components/shared/Spinner';

const Register = () => {
    const {loading, error} = useSelector(state => state.auth)
    return (
        <>
            {error && <span>{alert(error)}</span>}
            {loading ? <Spinner /> : (
                <div className='RegisterForm-container'>
                    <Form formTitle={'REGISTER'} submitBtn={'Register'} formType={'register'} />
                </div>
            )}
        </>
    )
}

export default Register;