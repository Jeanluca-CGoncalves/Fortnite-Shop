import { Link, useLocation } from 'react-router-dom'; // 1. Importe useLocation
import { FaUserCircle, FaStore, FaStar, FaSignOutAlt } from "react-icons/fa";
import './navbar.css'; 
import Logo from '../../assets/Logo.jpg'; 
import Vbucks from '../../assets/vbucks.png';
import { FaUsers } from "react-icons/fa";

function Navbar() { 
    const userBalance = 1500; 
    const location = useLocation(); // 2. Pegue a localização atual

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
                            // 3. Lógica: Se o caminho for "/", ativa a classe
                            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            <FaStore /> Loja
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/novidades" 
                            // 4. Lógica: Se o caminho for "/novidades", ativa a classe
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
                <div className="balance-pill">
                    <span>{userBalance}</span>
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