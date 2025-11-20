import React, { useEffect, useState } from 'react';
import './Perfil.css';
import { FaUserCircle, FaWallet, FaStar, FaUndo } from 'react-icons/fa';

import api from "../../services/api";  // CAMINHO CORRIGIDO
import Vbucks from '../../assets/vbucks.png';

const Perfil = () => {

  const [activeTab, setActiveTab] = useState('skins');
  const [user, setUser] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [historico, setHistorico] = useState([]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/privado");
      setUser(response.data.usuario);
    } catch {
      alert("Erro ao carregar usuário.");
    }
  };

  const fetchInventario = async () => {
    try {
      const response = await api.get("/inventario");
      setInventario(response.data.itens);
    } catch (err) {}
  };

  const fetchHistorico = async () => {
    try {
      const response = await api.get("/historico");
      setHistorico(response.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchUser();
    fetchInventario();
    fetchHistorico();
  }, []);

  const handleRefund = async (itemId) => {
    try {
      await api.post("/refund", { itemId });
      alert("Item devolvido!");
      fetchInventario();
      fetchHistorico();
      fetchUser();
    } catch {
      alert("Erro ao devolver item.");
    }
  };

  if (!user) return <p style={{ color: "white", textAlign: "center" }}>Carregando...</p>;

  return (
    <div className="player-profile-page">

      <header className="profile-main-header">
        <h1>Meu Perfil</h1>
      </header>

      <section className="profile-top-section">

        {/* INFO */}
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
            </div>
          </div>
        </div>

        {/* SALDO */}
        <div className="profile-card wallet-card">
          <header className="profile-card-header">
            <h3><FaWallet /> Saldo</h3>
          </header>

          <div className="wallet-body centered">
            <div className="vbucks-display-large">
              <span className="detail-label">Seus V-Bucks</span>

              <div className="vbucks-value-row">
                <img src={Vbucks} alt="V-Bucks" className="vbucks-icon-img" />
                <h2>{user.vbucks}</h2>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* TABS */}
      <nav className="profile-tabs">
        <button className={activeTab === 'skins' ? 'active' : ''} onClick={() => setActiveTab('skins')}>
          Meus Itens
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          Histórico
        </button>
      </nav>

      <main className="profile-content">

        {/* INVENTÁRIO */}
        {activeTab === 'skins' && (
          <section className="skins-collection">
            <h2 className="content-title">
              <FaStar /> Itens Adquiridos ({inventario.length})
            </h2>

            <div className="skins-grid">
              {inventario.map(item => (
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
              ))}
            </div>
          </section>
        )}

        {/* HISTÓRICO */}
        {activeTab === 'history' && (
          <section className="purchase-history">
            <h2 className="content-title">Histórico</h2>

            {historico.length === 0 ? (
              <div className="empty-state"><p>Nenhuma transação encontrada.</p></div>
            ) : (
              <ul className="history-list">
                {historico.map(h => (
                  <li key={h.id}>
                    {h.tipo === "COMPRA" ? `Comprou ${h.item.nome}` : `Estornou ${h.item.nome}`}
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
