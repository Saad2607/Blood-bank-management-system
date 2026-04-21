import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DonarListHospital = () => {
    const {user} = useSelector(state => state.auth);
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    
    // find donar records
    const getDonarsListHospital = async () => {
        try {
            const {data} = await API.post("/inventory/get-inventory-hospital", {
                filters: {
                    inventoryType: 'in',
                    donar: user?._id,
                },
            });
            console.log(data);
            if(data?.success) {
                setData(data?.inventory);
                console.log(data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getDonarsListHospital();
    }, []);

    const handleDetails = () => {
        navigate('/details');
    };

  return (
    <Layout>
        <div className='container mt-4'>
            <table className="table">
                <thead>
                    <tr>
                        <th scope='col'>Name</th>
                        <th scope="col">Blood Group</th>
                        <th scope="col">Inventory Type</th>
                        <th scope="col">Quantity (ml)</th>
                        <th scope="col">Date & Time</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((record) => (
                        <tr key={record._id}>
                            <td>{record.donar.name}</td>
                            <td>{record.bloodGroup}</td>
                            <td>{record.inventoryType}</td>
                            <td>{record.quantity} (ml)</td>
                            <td>{moment(record.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                            <td>
                                <button className='btn btn-success' onClick={() => handleDetails()}>Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Layout>
  );
};

export default DonarListHospital;
