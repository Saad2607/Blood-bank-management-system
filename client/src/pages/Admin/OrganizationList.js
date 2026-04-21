import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import { useNavigate } from 'react-router-dom';

const HospitalList = () => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    
    // find donar records
    const getDonars = async () => {
        try {
            const {data} = await API.get("/admin/organization-list");
            // console.log(data);
            if(data?.success) {
                setData(data?.organizationData);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getDonars();
    }, []);

    // DELETE FUNCTION
    const handleDelete = async (id) => {
      try {
        let answer = window.prompt('Are You Sure You Want To Delete This Organization', "Sure");
        if(!answer) return;
        const {data} = await API.delete(`/admin/delete-organization/${id}`);
        alert(data?.message);
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    }
    
    const handleDetails = () => {
      navigate('/details');
    };

  return (
    <Layout>
        <div className='container mt-4'>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope='col'>City</th>
                        {/* <th scope="col">Action</th> */}
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((record) => (
                        <tr key={record._id}>
                            <td>{record.organizationName}</td>
                            <td>{record.address}</td>
                            {/* <td>
                              <button className='btn btn-success' onClick={() => handleDetails()}>Details</button>
                            </td> */}
                            <td>
                              <button className='btn btn-danger' onClick={() => handleDelete(record._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Layout>
  );
};

export default HospitalList;
