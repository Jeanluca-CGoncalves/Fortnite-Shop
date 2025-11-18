import React, { useState } from 'react';
import './Perfil.css';
import { 
  FaUserCircle, 
  FaWallet, 
  FaStar, 
  FaUndo 
} from 'react-icons/fa';

// Importação da imagem que você fez
import Vbucks from '../../assets/vbucks.png'; 

const userData = {
  id: "Shadow Striker",
  email: "player@fortnite.com",
};

const walletData = {
  vbucks: 1500,
};

const skinsData = [
  { id: 1, name: "Raven", rarity: "Legendary", imageUrl: "https://via.placeholder.com/300x200?text=Raven+Skin" },
  { id: 2, name: "Drift", rarity: "Epic", imageUrl: "https://via.placeholder.com/300x200?text=Drift+Skin" },
  { id: 3, name: "Peely", rarity: "Epic", imageUrl: "https://via.placeholder.com/300x200?text=Peely+Skin" },
  { id: 4, name: "Saturn", rarity: "Legendary", imageUrl: "https://via.placeholder.com/300x200?text=Saturn+Skin" },
  { id: 5, name: "Nebula", rarity: "Epic", imageUrl: "https://via.placeholder.com/300x200?text=Nebula+Skin" },
  { id: 6, name: "Uranus", rarity: "Legendary", imageUrl: "https://via.placeholder.com/300x200?text=Uranus+Skin" },
];

const Perfil = () => {
  const [activeTab, setActiveTab] = useState('skins'); 

  const handleRefund = (itemName) => {
    alert(`Você devolveu o item: ${itemName}. Seus V-Bucks foram estornados.`);
  };

  return (
    <div className="player-profile-page">
      
      <header className="profile-main-header">
        <h1>Meu Perfil</h1>
      </header>

      <section className="profile-top-section">

        {/* CARD DE INFORMAÇÕES */}
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
                <span className="detail-label">ID do Jogador</span>
                <h4>{userData.id}</h4>
              </div>
              <div className="detail-group">
                <span className="detail-label">E-mail</span>
                <h4>{userData.email}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* CARD DA CARTEIRA */}
        <div className="profile-card wallet-card">
          <header className="profile-card-header">
            <h3><FaWallet /> Saldo</h3>
          </header>
          <div className="wallet-body centered">
            <div className="vbucks-display-large">
                <span className="detail-label">Seus V-Bucks</span>
                <div className="vbucks-value-row">
                    
                    {/* AQUI ESTÁ A IMAGEM DO VBUCKS */}
                    <img src={Vbucks} alt="V-Bucks" className="vbucks-icon-img" />
                    
                    <h2>{walletData.vbucks}</h2>
                </div>
            </div>
          </div>
        </div>

      </section>

      <nav className="profile-tabs">
        <button 
          className={activeTab === 'skins' ? 'active' : ''}
          onClick={() => setActiveTab('skins')}
        >
          Meus Itens
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Histórico de Compras
        </button>
      </nav>

      <main className="profile-content">
        
        {activeTab === 'skins' && (
          <section className="skins-collection">
            <div className="tab-header">
                 <h2 className="content-title"><FaStar /> Itens Adquiridos ({skinsData.length})</h2>
            </div>
           
            <div className="skins-grid">
              {skinsData.map(skin => (
                <div className="skin-card" key={skin.id}>
                  <div className="skin-image-container">
                    <img src={skin.imageUrl} alt={skin.name} />
                    <span className={`rarity-tag ${skin.rarity.toLowerCase()}`}>
                      {skin.rarity}
                    </span>
                  </div>
                  <div className="skin-card-footer">
                    <h4>{skin.name}</h4>
                    <button 
                        className="refund-btn" 
                        onClick={() => handleRefund(skin.name)}
                    >
                        <FaUndo /> Desfazer compra
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="purchase-history">
            <h2 className="content-title">Histórico</h2>
            <div className="empty-state">
                <p>Nenhuma transação recente.</p>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default Perfil;