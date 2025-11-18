import React, { useState } from 'react';
import './Comunidade.css';
import { FaSearch, FaUserCircle, FaTimes, FaStar } from 'react-icons/fa';

// DADOS MOCKADOS (Simulando outros jogadores)
const mockUsers = [
  { id: 1, name: "Ninja", skins: 120, avatarColor: "#d37e28", collection: ["Raven", "Drift", "Peely"] },
  { id: 2, name: "Tfue", skins: 85, avatarColor: "#8a2be2", collection: ["Saturn", "Nebula"] },
  { id: 3, name: "Bugha", skins: 200, avatarColor: "#00d8ff", collection: ["Raven", "Uranus", "Peely", "Drift"] },
  { id: 4, name: "Loserfruit", skins: 50, avatarColor: "#66cc33", collection: ["Peely", "Nebula"] },
  { id: 5, name: "Myth", skins: 90, avatarColor: "#ed1d24", collection: ["Drift", "Raven"] },
  { id: 6, name: "Pokimane", skins: 150, avatarColor: "#00cfba", collection: ["Saturn", "Uranus", "Nebula"] },
];

const Comunidade = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // Usuário clicado

  // Filtra usuários pelo nome
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="comunidade-container">
      
      <header className="comunidade-header">
        <div className="header-content">
            <h1>Comunidade</h1>
            <p>Encontre outros jogadores e veja suas coleções</p>
        </div>
        
        <div className="search-bar">
            <FaSearch className="search-icon"/>
            <input 
                type="text" 
                placeholder="Buscar jogador..." 
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </header>

      {/* GRID DE JOGADORES */}
      <div className="users-grid">
        {filteredUsers.map(user => (
            <div className="user-card" key={user.id} onClick={() => setSelectedUser(user)}>
                <div className="user-avatar" style={{borderColor: user.avatarColor}}>
                    <FaUserCircle />
                </div>
                <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.skins} Skins adquiridas</p>
                </div>
                <button className="view-profile-btn">Ver Coleção</button>
            </div>
        ))}
      </div>

      {/* MODAL (Abre quando clica num usuário) */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="modal-user">
                        <FaUserCircle className="modal-avatar" style={{color: selectedUser.avatarColor}}/>
                        <div>
                            <h2>{selectedUser.name}</h2>
                            <span>ID: #{selectedUser.id}8392</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={() => setSelectedUser(null)}>
                        <FaTimes />
                    </button>
                </header>

                <div className="modal-body">
                    <h3><FaStar /> Coleção ({selectedUser.collection.length})</h3>
                    <div className="mini-skins-grid">
                        {selectedUser.collection.map((skin, index) => (
                            <div className="mini-skin-card" key={index}>
                                <img src={`https://via.placeholder.com/150?text=${skin}`} alt={skin} />
                                <span>{skin}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Comunidade;