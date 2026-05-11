import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Navbar.css";

export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        localStorage.removeItem("token");
        navigate("/login");
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the menu is open and the user clicks something outside the ref
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);
    return (
        <div className='navbar'>
            <div className='navbar-links'>
                <h5><Link to="/">MoMoney</Link></h5>
                {token && <Link to="/dashboard">Dashboard</Link>}
            </div>
            <div className='navbar-menu'>
                {token ? (
                    <div className="dropdown-container" ref={dropdownRef}>
                        <button className="account-btn" onClick={toggleDropdown}>
                            Account
                        </button>
                    
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>
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