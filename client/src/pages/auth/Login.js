import React from 'react';
import Form from '../../components/shared/Form/Form';
import {useSelector} from 'react-redux';
import Spinner from '../../components/shared/Spinner';

const Login = () => {
    const {loading, error} = useSelector(state => state.auth);
    return (
        <>
            {error && <span>{alert(error)}</span>}
            {loading ? <Spinner /> : (
                <div className='LoginForm-container'>
                    <Form 
                        formTitle={'LOGIN'} 
                        submitBtn={'Login'} 
                        formType={'login'} 
                    />
                </div>
            )}   
        </>
    );
};

export default Login;