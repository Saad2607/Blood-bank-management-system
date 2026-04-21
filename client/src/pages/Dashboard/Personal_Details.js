import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import Spinner from '../../components/shared/Spinner';
import { useNavigate } from 'react-router-dom';

const Personal_Details = () => {
 
  const [data, setData] = useState('');
  const navigate = useNavigate();

  const getPersonalDetails = async () => {
    try {
      const response = await API.get("/auth/personal-details");
      // console.log(response.data);
      if(response?.data?.success) {
        setData(response?.data?.personalDetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPersonalDetails();
  }, []);

  const handleDetails = () => {
    navigate('/user-details');
  };

  return (
    <Layout>
      <div className='container mt-4'>
        {data ? (
          <table className='table'>
            <thead>
              <tr>
                <th scope='col'>Name</th>
                <th scope='col'>Email</th>
                <th scope='col'>Phone Number</th>
                <th scope='col'>Diseases</th>
                <th scope='col'>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.name}</td>
                <td>{data.email}</td>
                <td>{data.phone}</td>
                <td>{data.address}</td>
                <td>
                  <button className='btn btn-success' onClick={() => handleDetails()}>Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <Spinner />
        )}
      </div>
    </Layout>
  );
};

export default Personal_Details;