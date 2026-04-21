import {Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/Routes/ProtectedRoute';
import PublicRoute from './components/Routes/PublicRoute';
import Donar from './pages/Dashboard/Donar';
import Hospital from './pages/Dashboard/Hospital';
import Organization from './pages/Dashboard/Organization';
import Consumer from './pages/Dashboard/Consumer';
import Donation from './pages/Dashboard/Donation';
import Analytics from './pages/Dashboard/Analytics';
import DonarList from './pages/Admin/DonarList';
import HospitalList from './pages/Admin/HospitalList';
import OrganizationList from './pages/Admin/OrganizationList';
import AdminHome from './pages/Admin/AdminHome';
import Personal_Details from './pages/Dashboard/Personal_Details';
import DonarListHospital from './pages/Dashboard/DonarListHospital';
import Details from './pages/Details/Details';
import DetailsForPersonalUser from './pages/Details/DetailsForPersonalUser';
import DetailsForDonarList from './pages/Details/DetailsForDonarList';
import Articles from './pages/Dashboard/Articles';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route 
          path='/'
          element={
            <ProtectedRoute>
              <HomePage /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/details'
          element={
            <ProtectedRoute>
              <Details /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/user-details'
          element={
            <ProtectedRoute>
              <DetailsForPersonalUser /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/motivation'
          element={
            <ProtectedRoute>
              <Articles /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/details-donar-list'
          element={
            <ProtectedRoute>
              <DetailsForDonarList /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/donar-list-hospital'
          element={
            <ProtectedRoute>
              <DonarListHospital /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/personal-details'
          element={
            <ProtectedRoute>
              <Personal_Details /> 
            </ProtectedRoute> 
          } 
        />
        
        <Route 
          path='/donar' 
          element={
            <ProtectedRoute>
              <Donar /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/admin' 
          element={
            <ProtectedRoute>
              <AdminHome /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/hospital' 
          element={
            <ProtectedRoute>
              <Hospital /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/analytics' 
          element={
            <ProtectedRoute>
              <Analytics /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/donar-list' 
          element={
            <ProtectedRoute>
              <DonarList /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/hospital-list' 
          element={
            <ProtectedRoute>
              <HospitalList /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/organization-list' 
          element={
            <ProtectedRoute>
              <OrganizationList /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/consumer' 
          element={
            <ProtectedRoute>
              <Consumer /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/donation' 
          element={
            <ProtectedRoute>
              <Donation /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/organization' 
          element={
            <ProtectedRoute>
              <Organization /> 
            </ProtectedRoute> 
          } 
        />
        <Route 
          path='/login' 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path='/register' 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
