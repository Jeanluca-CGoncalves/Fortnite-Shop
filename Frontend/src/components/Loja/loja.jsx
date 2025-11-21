import React, { useEffect, useState } from 'react';
import './loja.css';
import { FaShoppingCart, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import Vbucks from '../../assets/vbucks.png';
import api from "../../services/api";

const Loja = ({ saldo, setSaldo }) => { 
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [apenasNovos, setApenasNovos] = useState(false);
  const [apenasVenda, setApenasVenda] = useState(false);
  const [apenasPromo, setApenasPromo] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);

  const raritiesOptions = [
    { value: 'Legendary', label: 'Lendário', color: '#d37e28' },
    { value: 'Epic', label: 'Épico', color: '#8a2be2' },
    { value: 'Rare', label: 'Raro', color: '#00d8ff' },
    { value: 'Uncommon', label: 'Incomum', color: '#66cc33' },
    { value: 'Icon Series', label: 'Série Ícones', color: '#00cfba' },
    { value: 'Marvel Series', label: 'Marvel', color: '#ed1d24' }
  ];
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await api.get('/api/tipos');
        console.log(' Tipos encontrados:', response.data.tipos);
        setTiposDisponiveis(response.data.tipos || []);
      } catch (err) {
        console.error(' Erro ao buscar tipos:', err);
      }
    };
    fetchTipos();
  }, []);

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      try {
        console.log(' Buscando TODOS os cosméticos...');
        
        const response = await api.get('/api/cosmeticos?limit=50000');
        const cosmeticos = response.data.data;

        console.log(`✅ ${cosmeticos.length} itens carregados da API!`);
        
        setItems(cosmeticos);
        setFilteredItems(cosmeticos);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  useEffect(() => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRarities.length > 0) {
      filtered = filtered.filter(item =>
        selectedRarities.includes(item.raridade)
      );
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item =>
        selectedTypes.includes(item.tipo)
      );
    }

    if (dataInicio) {
      filtered = filtered.filter(item =>
        new Date(item.addedAt) >= new Date(dataInicio)
      );
    }
    if (dataFim) {
      filtered = filtered.filter(item =>
        new Date(item.addedAt) <= new Date(dataFim)
      );
    }

    if (apenasNovos) {
      filtered = filtered.filter(item => item.isNew === true);
    }
    if (apenasVenda) {
      filtered = filtered.filter(item => item.isForSale === true);
    }
    if (apenasPromo) {
      filtered = filtered.filter(item => item.isPromo === true);
    }

    console.log(`🔍 Filtros aplicados: ${filtered.length} itens encontrados`);
    setFilteredItems(filtered);
    setCurrentPage(1); 
  }, [searchTerm, selectedRarities, selectedTypes, dataInicio, dataFim, apenasNovos, apenasVenda, apenasPromo, items]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const toggleRarity = (value) => {
    if (selectedRarities.includes(value)) {
      setSelectedRarities(selectedRarities.filter(item => item !== value));
    } else {
      setSelectedRarities([...selectedRarities, value]);
    }
  };

  const toggleType = (value) => {
    if (selectedTypes.includes(value)) {
      setSelectedTypes(selectedTypes.filter(item => item !== value));
    } else {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setSelectedRarities([]);
    setSelectedTypes([]);
    setDataInicio('');
    setDataFim('');
    setApenasNovos(false);
    setApenasVenda(false);
    setApenasPromo(false);
  };

  const handleBuy = async (cosmeticoId, preco, nome) => {
    if (!preco || preco === 0) {
      alert("Este item não possui preço definido!");
      return;
    }

    if (preco > saldo) {
      alert(` Saldo insuficiente!\n\nVocê tem: ${saldo.toLocaleString()} V-Bucks\nPrecisa de: ${preco.toLocaleString()} V-Bucks`);
      return;
    }

    if (!window.confirm(`Confirmar compra de "${nome}" por ${preco.toLocaleString()} V-Bucks?`)) {
      return;
    }

    try {
      const response = await api.post("/store/comprar", { cosmeticoId });
      alert("✅ " + response.data.mensagem);
      
      if(setSaldo && response.data.saldoAtual !== undefined) {
        setSaldo(response.data.saldoAtual); 
      } else {
          const userResponse = await api.get('/privado');
          if (userResponse.data) {
             setSaldo(userResponse.data.vbucks);
          }
      }
    } catch (error) {
      alert("Erro: " + (error.response?.data?.erro || "Erro desconhecido"));
    }
  };

  return (
    <div className="loja-container">

      <header className="loja-header">
        <div className="header-content">
          <h1>LOJA DE ITENS</h1>
          <p>Atualiza diariamente às 21:00</p>
          
        </div>

        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-wrapper">
            <button
              className="filter-btn-toggle"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FaFilter />
              {(selectedRarities.length + selectedTypes.length) > 0 
                ? `${selectedRarities.length + selectedTypes.length} Filtros` 
                : 'Filtrar'}
              <FaChevronDown className={`arrow ${isFilterOpen ? 'open' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="filter-dropdown">
                <h4 style={{margin: '0 0 10px', fontSize: '0.9rem', opacity: 0.8}}>📊 Raridade</h4>
                {raritiesOptions.map((option) => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedRarities.includes(option.value)}
                      onChange={() => toggleRarity(option.value)}
                    />
                    <span style={{ color: option.color, fontWeight: 'bold' }}>
                      {option.label}
                    </span>
                  </label>
                ))}

                <h4 style={{margin: '20px 0 10px', fontSize: '0.9rem', opacity: 0.8}}>🎒 Tipo de Item</h4>
                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {tiposDisponiveis.length === 0 ? (
                    <p style={{fontSize: '0.85rem', opacity: 0.6, padding: '10px'}}>
                      Carregando tipos...
                    </p>
                  ) : (
                    tiposDisponiveis.map((tipo) => (
                      <label key={tipo} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(tipo)}
                          onChange={() => toggleType(tipo)}
                        />
                        <span>{tipo}</span>
                      </label>
                    ))
                  )}
                </div>

                <h4 style={{margin: '20px 0 10px', fontSize: '0.9rem', opacity: 0.8}}>📅 Data</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <input 
                    type="date" 
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '5px',
                      color: 'white'
                    }}
                  />
                  <input 
                    type="date" 
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '5px',
                      color: 'white'
                    }}
                  />
                </div>

                <h4 style={{margin: '20px 0 10px', fontSize: '0.9rem', opacity: 0.8}}>🔍 Outros</h4>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={apenasNovos}
                    onChange={(e) => setApenasNovos(e.target.checked)}
                  />
                  <span> Apenas Novos</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={apenasVenda}
                    onChange={(e) => setApenasVenda(e.target.checked)}
                  />
                  <span> Apenas à Venda</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={apenasPromo}
                    onChange={(e) => setApenasPromo(e.target.checked)}
                  />
                  <span> Apenas Promoções</span>
                </label>

                <button className="clear-filter" onClick={limparFiltros}>
                   Limpar Todos os Filtros
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <div className="loja-grid-section">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p style={{color: 'white', marginTop: '20px'}}>Carregando todos os itens...</p>
          </div>
        ) : (
          <>
            <div className="items-grid">
              {currentItems.length === 0 ? (
                <p style={{textAlign: 'center', fontSize: '1.5rem', gridColumn: '1/-1'}}>
                  Nenhum item encontrado com esses filtros.
                </p>
              ) : (
                currentItems.map((item) => (
                  <div className={`shop-card border-${item.raridade?.toLowerCase()}`} key={item.id}>
                    <div className="card-image-box">
                      <img src={item.imagemUrl || 'https://via.placeholder.com/200'} alt={item.nome} />
                      <span className={`rarity-label bg-${item.raridade?.toLowerCase()}`}>
                        {item.raridade}
                      </span>
                      
                      <div style={{position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        {item.isNew && (
                          <span style={{background: '#ffc107', color: '#000', padding: '3px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 'bold'}}>
                             NOVO
                          </span>
                        )}
                        {item.isForSale && (
                          <span style={{background: '#4caf50', color: '#fff', padding: '3px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 'bold'}}>
                             VENDA
                          </span>
                        )}
                        {item.isPromo && (
                          <span style={{background: '#ff5722', color: '#fff', padding: '3px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 'bold'}}>
                             PROMO
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="card-info">
                      <h3>{item.nome}</h3>
                      <p className="item-type">{item.tipo}</p>

                      <div className="price-row">
                        <img src={Vbucks} alt="vbucks" className="price-icon" />
                        <span>
                          {item.preco !== null && item.preco !== undefined && item.preco > 0
                            ? item.preco.toLocaleString() 
                            : '---'}
                        </span>
                      </div>

                      <button 
                        className="buy-btn" 
                        onClick={() => handleBuy(item.id, item.preco, item.nome)}
                        disabled={!item.preco || item.preco === 0 || item.preco > saldo}
                        style={{
                          opacity: (!item.preco || item.preco === 0 || item.preco > saldo) ? 0.5 : 1,
                          cursor: (!item.preco || item.preco === 0 || item.preco > saldo) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <FaShoppingCart /> 
                        {!item.preco || item.preco === 0 ? 'Sem Preço' : 
                         item.preco > saldo ? 'Saldo Insuficiente' : 'Comprar'}
                      </button>
                  </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ◀ Anterior
                </button>

                <div className="pagination-info">
                  Página {currentPage} de {totalPages}
                  <br />
                  <span style={{fontSize: '0.9rem', opacity: 0.8}}>
                    Exibindo {startIndex + 1} a {Math.min(endIndex, filteredItems.length)} de {filteredItems.length.toLocaleString()} itens
                  </span>
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Próximo ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{textAlign: 'center', marginTop: '30px', fontSize: '1.3rem', opacity: 0.9, background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px'}}>
        📊 Total de itens: <strong>{filteredItems.length.toLocaleString()}</strong> de <strong>{items.length.toLocaleString()}</strong>
      </div>

    </div>
  );
};

export default Loja;