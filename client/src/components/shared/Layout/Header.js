import React from 'react';
import { MdBloodtype } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
    const {user} = useSelector(state => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    // logout handler
    const handleLogout = () => {
        localStorage.clear();
        alert('Logout Successfully');
        navigate('/login');
    }
  return (
    <>
      <nav className='navbar'>
        <div className='container-fluid'>
            <div className='navbar-brand'><MdBloodtype color='red' /> PULSE POINT</div>
            <ul className='navbar-nav flex-row'>
                <li className='nav-item mx-3'>
                    <p className='nav-link'>
                        <FaRegUserCircle/> Welcome {user?.name || user?.hospitalName || user?.organizationName} &nbsp;
                        <span className="badge text-bg-secondary">{user?.role}</span>
                    </p>
                </li>
                {(location.pathname === "/" || location.pathname === "/donar" || location.pathname === "/hospital" || location.pathname === "/consumer" || location.pathname === "/organization") ? (
                    <li className='nav-item mx-3'>
                      <Link to="/analytics" className='nav-link'>
                        Analytics
                      </Link>
                    </li>
                  ) : (
                    <li className='nav-item mx-3'>
                      <Link to="/" className='nav-link'>
                        Home
                      </Link>
                    </li>
                  )
                }
                <li className='nav-item mx-3'>
                    <button className='btn btn-danger' onClick={handleLogout}>
                        Logout
                    </button>
                </li>
            </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;
