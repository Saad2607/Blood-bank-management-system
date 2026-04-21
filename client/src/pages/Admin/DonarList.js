import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import moment from 'moment';

const DonarList = () => {
    const [data, setData] = useState([]);
    
    // find donar records
    const getDonars = async () => {
        try {
            const {data} = await API.get("/admin/donar-list");
            // console.log(data);
            if(data?.success) {
                setData(data?.donarData);
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
        let answer = window.prompt('Are You Sure You Want To Delete This Donar', "Sure");
        if(!answer) return;
        const {data} = await API.delete(`/admin/delete-donar/${id}`);
        alert(data?.message);
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    }

  return (
    <Layout>
        <div className='container mt-4'>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Blood Group</th>
                        <th scope="col">Phone Number</th>
                        <th scope="col">Date & Time</th>
                        {/* <th scope="col">Action</th> */}
                        <th scope='col'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((record) => (
                        <tr key={record._id}>
                            <td>{record.name || record.organizationName + " (ORG)"}</td>
                            <td>{record.bloodGroup}</td>
                            <td>{record.phone}</td>
                            <td>{moment(record.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                            
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

export default DonarList;
