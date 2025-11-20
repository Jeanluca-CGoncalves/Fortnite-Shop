// Frontend/src/components/layout/navbar.jsx

import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaStore, FaStar, FaSignOutAlt, FaUsers } from "react-icons/fa";
import './navbar.css'; 
import Logo from '../../assets/Logo.jpg'; 
import Vbucks from '../../assets/vbucks.png';

// O componente agora espera a prop 'saldo'
function Navbar({ saldo }) { 
    // REMOVIDO: const userBalance = 1500; 
    const location = useLocation(); 

    return(
        <nav className="navbar"> 
            
            {/* ESQUERDA */}
            <div className="navbar-section left">
                <Link to="/" className="logo-container">
                    <img src={Logo} alt="Fortnite Shop" />
                </Link>
            </div>

            {/* CENTRO */}
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

            {/* DIREITA */}
            <div className="navbar-section right">
                {/* EXIBE A PROP 'SALDO' */}
                <div className="balance-pill">
                    {/* Exibe o saldo recebido e formatado */}
                    <span>{saldo ? saldo.toLocaleString() : '0'}</span> 
                    <img src={Vbucks} alt="V-Bucks" className="icon-vbucks-nav" />
                </div>

                <div className="separator"></div> 

                <Link to="/perfil" className="profile-btn" title="Meu Perfil">
                    <FaUserCircle size={24} />
                </Link>

                <Link to="/login" className="logout-btn" title="Sair">
                    <FaSignOutAlt size={20} />
                </Link>
            </div>
        </nav>
    )
}

export default Navbar;