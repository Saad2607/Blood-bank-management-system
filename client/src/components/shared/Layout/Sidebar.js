import React from 'react';
// import { userMenu } from './Menus/userMenu';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../../styles/Layout.css';

const Sidebar = () => {
  // GET USER STATE
  const {user} = useSelector(state => state.auth);

  const location = useLocation();
  return (
    <div>
      <div className='sidebar'>
        <div className='menu'>
          {user?.role === 'organization' && (
            <>
              <div className={`menu-item ${location.pathname === "/" && 'active'}`} >
                <i className="fa-solid fa-warehouse"></i>
                <Link to="/">Inventory</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/donar" && 'active'}`} >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donar">Donar</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/hospital" && 'active'}`} >
                <i className="fa-solid fa-hospital"></i>
                <Link to="/hospital">Hospital</Link>
              </div>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <div className={`menu-item ${location.pathname === "/donar-list" && 'active'}`} >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donar-list">Donar List</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/hospital-list" && 'active'}`} >
                <i className="fa-solid fa-hospital"></i>
                <Link to="/hospital-list">Hospital List</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/organization-list" && 'active'}`} >
                <i className="fa-solid fa-building-ngo"></i>
                <Link to="/organization-list">Organization List</Link>
              </div>
            </>
          )}
          

          {(user?.role === 'hospital') && (
            <>
              <div className={`menu-item ${location.pathname === "/organization" && 'active'}`} >
                <i className="fa-solid fa-building-ngo"></i>
                <Link to="/organization">Organization</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/consumer" && 'active'}`} >
                <i className="fa-solid fa-republican"></i>
                <Link to="/consumer">Consumer</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/donar-list-hospital" && 'active'}`} >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donar-list-hospital">Donar List</Link>
              </div>
            </>
          )}

          {(user?.role === 'donar') && (
            <>
              <div className={`menu-item ${location.pathname === "/donation" && 'active'}`} >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donation">Donation</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/personal-details" && 'active'}`} >
                <i className="fa-solid fa-user"></i>
                <Link to="/personal-details">Personal-details</Link>
              </div>

              <div className={`menu-item ${location.pathname === "/motivation" && 'active'}`} >
                <i className="fa-solid fa-newspaper"></i>
                <Link to="/motivation">Motivation</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
