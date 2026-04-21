import moment from 'moment';
import React, { useEffect, useState } from 'react';
import API from '../../../services/API';

const ModalForHospital = () => {
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
        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">Details</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div className="modal-body">
                        {/* Render the table for "out" inventory Records */}
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th scope='col'>Blood Group</th>
                                    <th scope='col'>Inventory Type</th>
                                    <th scope='col'>Quantity (ml)</th>
                                    <th scope='col'>Time & Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((record) => (
                                    <tr key={record._id}>
                                        <td>{record.bloodGroup}</td>
                                        <td>{record.inventoryType}</td>
                                        <td>{record.quantity} (ml)</td>
                                        <td>{moment(record.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};

export default ModalForHospital;
