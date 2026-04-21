import Spinner from '../../../components/shared/Spinner';
import React, { useEffect, useState } from 'react';
import API from '../../../services/API';

const ModalForPersonalUser = () => {
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
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">Details</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            {/* Render the table for "out" inventory Records */}
                            {data ? (
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th scope='col'>Name</th>
                                            <th scope='col'>Email</th>
                                            <th scope='col'>Phone Number</th>
                                            <th scope='col'>Diseases</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{data.name}</td>
                                            <td>{data.email}</td>
                                            <td>{data.phone}</td>
                                            <td>{data.address}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <Spinner />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalForPersonalUser;
