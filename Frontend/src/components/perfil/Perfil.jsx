import React, { useEffect, useState } from 'react';
import './Perfil.css';
import { FaUserCircle, FaWallet, FaStar, FaUndo, FaCalendarAlt } from 'react-icons/fa';

import api from "../../services/api";
import Vbucks from '../../assets/vbucks.png';

const Perfil = ({ setSaldo }) => { 
  const [activeTab, setActiveTab] = useState('skins');
  const [user, setUser] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await api.get("/privado");
      const userData = response.data;
      setUser(userData);
      if (setSaldo) setSaldo(userData.vbucks);
    } catch (err) {
      setError("Falha ao carregar dados do usuário. Por favor, tente fazer login novamente.");
    }
  };

  const fetchInventario = async () => {
    try {
      const response = await api.get("/inventario");
      setInventario(response.data.itens || response.data); 
    } catch (err) {}
  };

  const fetchHistorico = async () => {
    try {
      const response = await api.get("/historico");
      setHistorico(response.data.data || response.data); 
    } catch (err) {}
  };

  useEffect(() => {
    fetchUser();
    fetchInventario();
    fetchHistorico();
  }, []);

  const handleRefund = async (itemId) => {
    try {
      const response = await api.post("/refund", { itemId }); 
      if (!response.data || typeof response.data.saldoAtual === 'undefined') {
        throw new Error("Resposta de reembolso incompleta do servidor.");
      }

      const novoSaldo = response.data.saldoAtual;

      if (setSaldo) setSaldo(novoSaldo);
      if (user) setUser(prev => ({ ...prev, vbucks: novoSaldo }));

      setInventario(prev => prev.filter(item => item.id !== itemId));

      alert("Item devolvido! Seu saldo foi atualizado.");

      await fetchHistorico();
      
    } catch (err) {
      alert("Erro ao devolver item. Verifique as regras de reembolso.");
      await fetchUser(); 
    }
  };

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  if (!user) return <p style={{ color: "white", textAlign: "center" }}>Carregando...</p>;

  return (
    <div className="player-profile-page">

      <header className="profile-main-header">
        <h1>Meu Perfil</h1>
      </header>

      <section className="profile-top-section">

        <div className="profile-card info-card">
          <header className="profile-card-header">
            <h3><FaUserCircle /> Informações Pessoais</h3>
          </header>

          <div className="info-card-body">
            <div className="avatar-container">
              <FaUserCircle className="avatar-icon" />
            </div>

            <div className="user-details">
              <div className="detail-group">
                <span className="detail-label">ID</span>
                <h4>{user.id}</h4>
              </div>

              <div className="detail-group">
                <span className="detail-label">E-mail</span>
                <h4>{user.email}</h4>
              </div>
                
              <div className="detail-group">
                <span className="detail-label"><FaCalendarAlt /> Membro Desde</span>
                <h4>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card wallet-card">
          <header className="profile-card-header">
            <h3><FaWallet /> Saldo</h3>
          </header>

          <div className="wallet-body centered">
            <div className="vbucks-display-large">
              <span className="detail-label">Seus V-Bucks</span>

              <div className="vbucks-value-row">
                <img src={Vbucks} alt="V-Bucks" className="vbucks-icon-img" />
                <h2>{(user.vbucks ?? 0).toLocaleString('pt-BR')}</h2> 
              </div>

            </div>
          </div>
        </div>

      </section>

      <nav className="profile-tabs">
        <button className={activeTab === 'skins' ? 'active' : ''} onClick={() => setActiveTab('skins')}>
          Meus Itens
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          Histórico
        </button>
      </nav>

      <main className="profile-content">

        {activeTab === 'skins' && (
          <section className="skins-collection">
            <h2 className="content-title">
              <FaStar /> Itens Adquiridos ({inventario.length})
            </h2>

            <div className="skins-grid">
              {inventario.length === 0 ? (
                <p>Nenhum item encontrado no seu inventário.</p>
              ) : (
                inventario.map(item => (
                  <div className="skin-card" key={item.id}>
                    <div className="skin-image-container">
                      <img src={item.cosmetico.imagemUrl} alt={item.cosmetico.nome} />
                      <span className={`rarity-tag ${item.cosmetico.raridade}`}>
                        {item.cosmetico.raridade}
                      </span>
                    </div>

                    <div className="skin-card-footer">
                      <h4>{item.cosmetico.nome}</h4>

                      <button className="refund-btn" onClick={() => handleRefund(item.id)}>
                        <FaUndo /> Desfazer compra
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="purchase-history">
            <h2 className="content-title">Histórico</h2>

            {historico.length === 0 ? (
              <div className="empty-state"><p>Nenhuma transação encontrada.</p></div>
            ) : (
              <ul className="history-list">
                {historico.map(h => (
                  <li key={h.id}>
                    <span className={`history-type ${h.tipo === "COMPRA" ? 'compra' : 'estorno'}`}>
                      {h.tipo}
                    </span>

                    {h.cosmetico ? (
                      <span> {h.cosmetico.nome} </span>
                    ) : (
                      <span> Item </span>
                    )}

                    — {new Date(h.data).toLocaleString("pt-BR")}
                  </li>
                ))}
              </ul>
            )}

          </section>
        )}

      </main>

    </div>
  );
};

export default Perfil;
