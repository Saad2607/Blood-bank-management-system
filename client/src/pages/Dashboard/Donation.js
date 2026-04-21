import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import moment from 'moment';
import { useSelector } from 'react-redux';

const Donation = () => {
    const {user} = useSelector(state => state.auth);
    const [data, setData] = useState([]);
    
    // find donar records
    const getDonars = async () => {
        try {
            const {data} = await API.post("/inventory/get-inventory-hospital", {
                filters: {
                    inventoryType: 'in',
                    donar: user?._id,
                },
            });
            if(data?.success) {
                setData(data?.inventory);
                console.log(data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getDonars();
    }, [])

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
                        <th scope="col">Email</th>
                        <th scope="col">Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((record) => (
                        <tr key={record._id}>
                            <td>{record.donar.name}</td>
                            <td>{record.bloodGroup}</td>
                            <td>{record.inventoryType}</td>
                            <td>{record.quantity} (ml)</td>
                            <td>{record.email}</td>
                            <td>{moment(record.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Layout>
  );
};

export default Donation;
