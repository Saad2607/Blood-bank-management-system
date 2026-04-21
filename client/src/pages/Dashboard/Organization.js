import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import { useSelector } from 'react-redux';
import moment from 'moment';

const Organization = () => {

    // get current user
    const {user} = useSelector(state => state.auth);
    const [data, setData] = useState([]);
    
    // find organization records
    const getOrganization = async () => {
        try {
            if(user?.role === 'donar') {
                const {data} = await API.get("/inventory/get-organizations");
                // console.log(data);
                if(data?.success) {
                    setData(data?.organizations);
                }
            }
            if(user?.role === 'hospital') {
                const {data} = await API.get("/inventory/get-organizations-for-hospital");
                // console.log(data);
                if(data?.success) {
                    setData(data?.organizations);
                }
            }
            
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getOrganization();
    }, [user]);

  return (
    <Layout>
        <div className='container mt-4'>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone Number</th>
                        <th scope="col">Address</th>
                        <th scope="col">Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((record) => (
                        <tr key={record._id}>
                            <td>{record.organizationName}</td>
                            <td>{record.email}</td>
                            <td>{record.phone}</td>
                            <td>{record.address}</td>
                            <td>{moment(record.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Layout>
  );
};

export default Organization;
