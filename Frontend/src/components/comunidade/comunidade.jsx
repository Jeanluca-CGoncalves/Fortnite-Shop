import React, { useState, useEffect } from 'react';
import './Comunidade.css';
import { FaSearch, FaUserCircle, FaTimes, FaStar } from 'react-icons/fa';
import api from '../../services/api';

const Comunidade = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Buscar USUÁRIOS REAIS do banco de dados
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/usuarios?limit=100');
        const usuarios = response.data.data;
        
        console.log(`✅ ${usuarios.length} usuários encontrados!`);
        setUsers(usuarios);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ Buscar ITENS de um usuário específico
  const verColecao = async (userId) => {
    try {
      const response = await api.get(`/api/usuarios/${userId}`);
      const userData = response.data.data;
      
      setSelectedUser({
        id: userData.id,
        email: userData.email,
        vbucks: userData.vbucks,
        totalItens: userData.itensComprados?.length || 0,
        collection: userData.itensComprados?.map(item => ({
          nome: item.cosmetico.nome,
          imagemUrl: item.cosmetico.imagemUrl,
          raridade: item.cosmetico.raridade,
          tipo: item.cosmetico.tipo,
          dataCompra: item.dataCompra
        })) || []
      });
    } catch (error) {
      console.error('Erro ao buscar coleção:', error);
      alert('Erro ao carregar coleção do usuário');
    }
  };

  // Filtra usuários pelo email
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cores aleatórias para avatares
  const avatarColors = ['#d37e28', '#8a2be2', '#00d8ff', '#66cc33', '#ed1d24', '#00cfba'];
  const getRandomColor = (index) => avatarColors[index % avatarColors.length];

  if (loading) {
    return (
      <div className="loja-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{color: 'white', marginTop: '20px'}}>Carregando comunidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comunidade-container">
      
      <header className="comunidade-header">
        <div className="header-content">
            <h1>Comunidade</h1>
            <p>Encontre outros jogadores e veja suas coleções ({users.length} jogadores)</p>
        </div>
        
        <div className="search-bar">
            <FaSearch className="search-icon"/>
            <input 
                type="text" 
                placeholder="Buscar jogador por email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </header>

      {/* GRID DE JOGADORES */}
      <div className="users-grid">
        {filteredUsers.length === 0 ? (
          <p style={{textAlign: 'center', fontSize: '1.5rem', gridColumn: '1/-1', color: 'white'}}>
            Nenhum jogador encontrado.
          </p>
        ) : (
          filteredUsers.map((user, index) => (
            <div className="user-card" key={user.id}>
                <div className="user-avatar" style={{borderColor: getRandomColor(index)}}>
                    <FaUserCircle style={{color: getRandomColor(index)}} />
                </div>
                <div className="user-info">
                    <h3>{user.email.split('@')[0]}</h3>
                    <p>{user.itensComprados?.length || 0} Itens adquiridos</p>
                    <p style={{fontSize: '0.85rem', opacity: 0.7}}>
                      💰 {user.vbucks?.toLocaleString() || 0} V-Bucks
                    </p>
                </div>
                <button 
                  className="view-profile-btn"
                  onClick={() => verColecao(user.id)}
                >
                  Ver Coleção
                </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL (Abre quando clica num usuário) */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="modal-user">
                        <FaUserCircle className="modal-avatar" style={{color: '#00d8ff'}}/>
                        <div>
                            <h2>{selectedUser.email.split('@')[0]}</h2>
                            <span>Email: {selectedUser.email}</span>
                            <p style={{marginTop: '5px', fontSize: '1rem'}}>
                              💰 Saldo: {selectedUser.vbucks?.toLocaleString() || 0} V-Bucks
                            </p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={() => setSelectedUser(null)}>
                        <FaTimes />
                    </button>
                </header>

                <div className="modal-body">
                    <h3><FaStar /> Coleção ({selectedUser.totalItens} itens)</h3>
                    
                    {selectedUser.collection.length === 0 ? (
                      <p style={{textAlign: 'center', padding: '30px', opacity: 0.7}}>
                        Este usuário ainda não possui itens.
                      </p>
                    ) : (
                      <div className="mini-skins-grid">
                          {selectedUser.collection.map((item, index) => (
                              <div className="mini-skin-card" key={index}>
                                  <img 
                                    src={item.imagemUrl || 'https://via.placeholder.com/150'} 
                                    alt={item.nome} 
                                  />
                                  <span className="item-name">{item.nome}</span>
                                  <span className="item-type">{item.tipo}</span>
                                  <span 
                                    className="item-rarity"
                                    style={{
                                      background: 
                                        item.raridade === 'Legendary' ? '#d37e28' :
                                        item.raridade === 'Epic' ? '#8a2be2' :
                                        item.raridade === 'Rare' ? '#00d8ff' :
                                        item.raridade === 'Uncommon' ? '#66cc33' : '#b0b8c4'
                                    }}
                                  >
                                    {item.raridade}
                                  </span>
                              </div>
                          ))}
                      </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Comunidade;