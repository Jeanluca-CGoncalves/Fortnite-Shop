import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'; // 1. Importe useLocation

// Componentes
import Navbar from './components/layout/navbar.jsx';
import Perfil from './components/perfil/Perfil.jsx';
import Loja from './components/Loja/loja.jsx';
import Novidades from './components/novidades/novidades.jsx';
import Comunidade from './components/comunidade/comunidade.jsx';
import Login from './components/login/login.jsx'; // Importe o Login
import Cadastro from './components/login/Cadastro.jsx'; // Importe o Cadastro

// Crie um componente interno para controlar a Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Lista de rotas onde a Navbar NÃO deve aparecer
  const hideNavbarRoutes = ['/login', '/cadastro'];

  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <div className='App'>
          <Routes>
             <Route path="/" element={<Loja />} /> 
             <Route path="/novidades" element={<Novidades />} />
             <Route path="/perfil" element={<Perfil />} />
             <Route path="/comunidade" element={<Comunidade />} />
             
             <Route path="/login" element={<Login />} />
             <Route path="/cadastro" element={<Cadastro />} />
          </Routes>
        </div>
      </Layout>
    </BrowserRouter>
  );
}

export default App;