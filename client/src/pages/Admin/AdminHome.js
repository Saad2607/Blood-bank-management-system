import React from 'react';
import Layout from '../../components/shared/Layout/Layout';
import { useSelector } from 'react-redux';

const AdminHome = () => {
  const { user } = useSelector(state => state.auth);
  return (
    <Layout>
      <div className='container'>
        <div className='d-flex flex-column mt-4'>
          <h1>Welcome <i className='text-success'>{user?.name}</i></h1>
          <h3>Manage Blood Bank Management System</h3>
          <hr />
          <p>
            The Admin in a Blood Bank Management System plays a vital role in ensuring the smooth operation of the system. 
            They are responsible for managing donor records, updating information about available blood units, and maintaining an 
            organized inventory to prevent shortages. The admin also handles blood requests from hospitals and patients, ensuring that the 
            right blood type is allocated efficiently. Additionally, they oversee user management, including hospital staff and blood recipients, 
            granting access to authorized personnel. Regular monitoring and reporting of blood stock levels, donation trends, and usage 
            statistics help in decision-making and maintaining a well-functioning system. The admin ensures that all operations run seamlessly, 
            contributing to efficient blood donation and distribution to those in need.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;
