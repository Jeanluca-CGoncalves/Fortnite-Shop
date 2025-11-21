import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaStore, FaStar, FaSignOutAlt, FaUsers } from "react-icons/fa";
import './navbar.css'; 
import Logo from '../../assets/Logo.jpg'; 
import Vbucks from '../../assets/vbucks.png';

function Navbar({ saldo }) { 
    const location = useLocation(); 

    return(
        <nav className="navbar"> 
            <div className="navbar-section left">
                <Link to="/" className="logo-container">
                    <img src={Logo} alt="Fortnite Shop" />
                </Link>
            </div>

            <div className="navbar-section center">
                <ul className="nav-links">
                    <li>
                        <Link 
                            to="/" 
                            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            <FaStore /> Loja
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/novidades" 
                            className={`nav-item ${location.pathname === '/novidades' ? 'active' : ''}`}
                        >
                            <FaStar /> Novidades
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/comunidade" 
                            className={`nav-item ${location.pathname === '/comunidade' ? 'active' : ''}`}
                        >
                            <FaUsers /> Comunidade
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="navbar-section right">
                <div className="balance-pill">
                    <span>{saldo ? saldo.toLocaleString() : '0'}</span> 
                    <img src={Vbucks} alt="V-Bucks" className="icon-vbucks-nav" />
                </div>

                <div className="separator"></div> 

                <Link to="/perfil" className="profile-btn">
                    <FaUserCircle size={24} />
                </Link>

                <Link to="/login" className="logout-btn">
                    <FaSignOutAlt size={20} />
                </Link>
            </div>
        </nav>
    )
}

export default Navbar;
