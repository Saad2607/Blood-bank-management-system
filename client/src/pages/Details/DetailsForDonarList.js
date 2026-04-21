import React, { useEffect, useState } from 'react';
import Header from '../../components/shared/Layout/Header';
import API from '../../services/API';
import ModalForDonarList from '../../components/shared/modal/ModalForDonarList';

const DetailsForDonarList = () => {
    const [data, setData] = useState('');

    const getDonars = async () => {
        try {
            const response = await API.get("/inventory/get-donars");
            // console.log(data);
            if (response?.data?.success) {
                setData(response?.data?.donars);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getDonars();
    }, [])

    return (
        <>
            <Header />
            <div className='text-center'>
                <h2>Name: {data.name}</h2>
                <h2>Email: {data.email}</h2>
                <h2>Phone Number: {data.phone}</h2>
                <hr />
            </div>
            <h4 className='ms-4' data-bs-toggle="modal" data-bs-target="#staticBackdrop" style={{ cursor: 'pointer' }}>
                <i className='fa-solid fa-plus text-success py-4'></i>&nbsp;
                Details
            </h4>
            <ModalForDonarList />
        </>
    );
};

export default DetailsForDonarList;
