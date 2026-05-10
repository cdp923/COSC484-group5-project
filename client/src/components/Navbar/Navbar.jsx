import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Navbar.css";

export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    return (
        <div className='navbar'>
            <div className='navbar-links'>
                <h5><Link to="/">MoMoney</Link></h5>
                {token && <Link to="/dashboard">Dashboard</Link>}
            </div>
            <div className='navbar-menu'>
                {token ? (
                    <div className="dropdown-container">
                    <button className="account-btn" onClick={toggleDropdown}>
                        Account
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/Home" onClick={() => setIsDropdownOpen(false)}>
                                Settings
                            </Link>
                            <button className="dropdown-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </div>
    );
}