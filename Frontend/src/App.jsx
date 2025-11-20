// Frontend/src/App.jsx

import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import api from "./services/api"; // Certifique-se que este caminho está correto

// Componentes
import Navbar from './components/layout/navbar.jsx';
import Perfil from './components/perfil/Perfil.jsx';
import Loja from './components/Loja/loja.jsx';
import Novidades from './components/novidades/novidades.jsx';
import Comunidade from './components/comunidade/comunidade.jsx';
import Login from './components/login/login.jsx';
import Cadastro from './components/login/Cadastro.jsx';

// Componente Layout para controlar a visibilidade da Navbar e passar o saldo
const Layout = ({ children, saldo }) => { 
    const location = useLocation();
    
    // Lista de rotas onde a Navbar NÃO deve aparecer
    const hideNavbarRoutes = ['/login', '/cadastro'];

    const showNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
        <>
            {/* Passa o saldo para a Navbar */}
            {showNavbar && <Navbar saldo={saldo} />} 
            {children}
        </>
    );
};

function App() {
    // ESTADO CENTRALIZADO DO SALDO
    const [saldoUsuario, setSaldoUsuario] = useState(0); 

    // EFEITO PARA BUSCAR O SALDO DO USUÁRIO
    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                // Chama a API para buscar os dados do usuário logado
                const response = await api.get('/privado');
                
                if (response.data) {
                    // Atualiza o estado centralizado com o saldo real (ou 10000 como fallback)
                    const vbucks = response.data.vbucks || 10000;
                    setSaldoUsuario(vbucks);
                    console.log(`✅ Saldo do usuário carregado no App.jsx: ${vbucks} V-Bucks`);
                }
            } catch (err) {
                console.log('❌ Usuário não logado ou erro ao buscar saldo.');
                setSaldoUsuario(0);
            }
        };
        fetchUsuario();
    }, []);

    return (
        <BrowserRouter>
            {/* PASSA O SALDO PARA O LAYOUT */}
            <Layout saldo={saldoUsuario}> 
                <div className='App'>
                    <Routes>
                         {/* PASSA O SALDO E O SETTER PARA O COMPONENTE LOJA */}
                         <Route 
                            path="/" 
                            element={<Loja 
                                saldo={saldoUsuario} 
                                setSaldo={setSaldoUsuario} 
                            />} 
                        />
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