import React, { useEffect, useState } from 'react';
import Header from '../../components/shared/Layout/Header';
import API from '../../services/API';
import ModalForPersonalUser from '../../components/shared/modal/ModalForPersonalUser';

const DetailsForPersonalUser = () => {
  const [data, setData] = useState('');

  const getPersonalDetails = async () => {
    try {
      const response = await API.get("/auth/personal-details");
      // console.log(response.data);
      if (response?.data?.success) {
        setData(response?.data?.personalDetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPersonalDetails();
  }, []);

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
      <ModalForPersonalUser />
    </>
  );
};

export default DetailsForPersonalUser;
