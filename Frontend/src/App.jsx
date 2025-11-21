import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import api from "./services/api";

import Navbar from './components/layout/navbar.jsx';
import Perfil from './components/perfil/Perfil.jsx';
import Loja from './components/Loja/loja.jsx';
import Novidades from './components/novidades/novidades.jsx';
import Comunidade from './components/comunidade/comunidade.jsx';
import Login from './components/login/Login.jsx';
import Cadastro from './components/login/Cadastro.jsx';

const Layout = ({ children, saldo, isAuthenticated, handleLogout }) => { 
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/cadastro'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname) && isAuthenticated;

  return (
    <>
      {showNavbar && <Navbar saldo={saldo} onLogout={handleLogout} />} 
      {children}
    </>
  );
};

function App() {
  const [saldoUsuario, setSaldoUsuario] = useState(0); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUsuario = async () => {
    try {
      const response = await api.get('/privado');
      if (response.data && response.data.vbucks) {
        const vbucks = response.data.vbucks;
        setSaldoUsuario(vbucks);
        setIsAuthenticated(true);
        return true;
      }
      setIsAuthenticated(false);
      setSaldoUsuario(0);
      return false;
    } catch {
      setIsAuthenticated(false);
      setSaldoUsuario(0);
      return false;
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  const handleLogin = () => {
    fetchUsuario();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSaldoUsuario(0);
  };

  return (
    <BrowserRouter>
      <Layout 
        saldo={saldoUsuario} 
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
      > 
        <div className='App'>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Loja saldo={saldoUsuario} setSaldo={setSaldoUsuario} /> : 
                <Navigate to="/login" replace />
              } 
            />

            <Route 
              path="/perfil" 
              element={
                isAuthenticated ? 
                <Perfil setSaldo={setSaldoUsuario} /> : 
                <Navigate to="/login" replace />
              } 
            />

            <Route 
              path="/novidades" 
              element={
                isAuthenticated ? 
                <Novidades /> : 
                <Navigate to="/login" replace />
              } 
            />

            <Route 
              path="/comunidade" 
              element={
                isAuthenticated ? 
                <Comunidade /> : 
                <Navigate to="/login" replace />
              } 
            />

            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
