import React, { useEffect, useState } from 'react';
import API from '../../services/API';
import Header from '../../components/shared/Layout/Header';
import ModalForHospital from '../../components/shared/modal/ModalForHospital';

const Details = () => {
  const [data, setData] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState([]);

  const getHospital = async () => {
    try {
      const {data} = await API.get('/inventory/get-inventory');
      if(data?.success) {
        // set hospital information from the first record
        if(data?.inventory.length > 0) {
          const {hospital} = data.inventory[0];
          if(hospital) {
            const { hospitalName, email, phone } = hospital;
            setHospitalInfo({ hospitalName, email, phone });
          }
        }
        // filter records to only show "out" inventory
        const filteredData = data?.inventory.filter((item) => item.inventoryType === 'out');
        setData(filteredData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getHospital();
  }, []);

  return (
    <>
      <Header />
      
      {/* Render Hospital information once */}
      <div className='text-center'>
        <h2>Hospital Name: {hospitalInfo.hospitalName || 'N/A'}</h2>
        <h2>Email ID: {hospitalInfo.email || 'N/A'}</h2>
        <h2>Phone Number: {hospitalInfo.phone || 'N/A'}</h2>
        <hr />
      </div>
      <h4 className='ms-4' data-bs-toggle="modal" data-bs-target="#staticBackdrop" style={{cursor: 'pointer'}}>
        <i className='fa-solid fa-plus text-success py-4'></i>&nbsp;
          Details
      </h4>
      <ModalForHospital />
      
    </>
  );
};

export default Details;