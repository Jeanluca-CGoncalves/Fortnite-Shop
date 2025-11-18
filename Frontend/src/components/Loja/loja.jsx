import React, { useEffect, useState } from 'react';
import './Loja.css';
import { FaShoppingCart, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import Vbucks from '../../assets/vbucks.png'; 

const Loja = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NOVOS ESTADOS PARA O FILTRO MÚLTIPLO
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState([]);

  const raritiesOptions = [
    { value: 'legendary', label: 'Lendário', color: '#d37e28' },
    { value: 'epic', label: 'Épico', color: '#8a2be2' },
    { value: 'rare', label: 'Raro', color: '#00d8ff' },
    { value: 'uncommon', label: 'Incomum', color: '#66cc33' },
    { value: 'icon_series', label: 'Série Ícones', color: '#00cfba' },
    { value: 'marvel', label: 'Marvel', color: '#ed1d24' }
  ];

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch('https://fortnite-api.com/v2/shop/br');
        const data = await response.json();
        
        let allEntries = [];
        if (data.data?.featured?.entries) allEntries = [...allEntries, ...data.data.featured.entries];
        if (data.data?.daily?.entries) allEntries = [...allEntries, ...data.data.daily.entries];

        setItems(allEntries);
        setFilteredItems(allEntries);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  // Lógica de Filtragem Múltipla
  useEffect(() => {
    if (selectedRarities.length === 0) {
        setFilteredItems(items); // Se nada selecionado, mostra tudo
    } else {
        const filtered = items.filter(entry => 
            selectedRarities.includes(entry.items[0]?.rarity?.value)
        );
        setFilteredItems(filtered);
    }
  }, [selectedRarities, items]);

  // Função para marcar/desmarcar checkbox
  const toggleRarity = (value) => {
      if (selectedRarities.includes(value)) {
          setSelectedRarities(selectedRarities.filter(item => item !== value));
      } else {
          setSelectedRarities([...selectedRarities, value]);
      }
  };

  const handleBuy = (itemName, price) => {
      alert(`Você comprou ${itemName} por ${price} V-Bucks!`);
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
                <FaSearch className="search-icon"/>
                <input type="text" placeholder="Buscar..." />
            </div>

            {/* NOVO COMPONENTE DE FILTRO MÚLTIPLO */}
            <div className="filter-wrapper">
                <button 
                    className="filter-btn-toggle" 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <FaFilter /> 
                    {selectedRarities.length > 0 ? `${selectedRarities.length} Filtros` : 'Filtrar'} 
                    <FaChevronDown className={`arrow ${isFilterOpen ? 'open' : ''}`}/>
                </button>

                {/* Dropdown de Checkboxes */}
                {isFilterOpen && (
                    <div className="filter-dropdown">
                        {raritiesOptions.map((option) => (
                            <label key={option.value} className="filter-option">
                                <input 
                                    type="checkbox" 
                                    checked={selectedRarities.includes(option.value)}
                                    onChange={() => toggleRarity(option.value)}
                                />
                                <span className="checkmark"></span>
                                <span style={{color: option.color, fontWeight: 'bold'}}>{option.label}</span>
                            </label>
                        ))}
                         <button className="clear-filter" onClick={() => setSelectedRarities([])}>Limpar Filtros</button>
                    </div>
                )}
            </div>
        </div>
      </header>

      <div className="loja-grid-section">
        {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
        ) : (
            <div className="items-grid">
                {filteredItems.map((entry, index) => {
                    const item = entry.items?.[0];
                    if (!item) return null;

                    const price = entry.finalPrice;
                    const rarityClass = item.rarity?.value || 'common';

                    return (
                        <div className={`shop-card border-${rarityClass}`} key={entry.id || index}>
                            <div className="card-image-box">
                                <img src={item.images.icon || item.images.featured} alt={item.name} />
                                <span className={`rarity-label bg-${rarityClass}`}>
                                    {item.rarity?.displayValue}
                                </span>
                            </div>

                            <div className="card-info">
                                <h3>{item.name}</h3>
                                <p className="item-type">{item.type?.displayValue}</p>
                                <div className="price-row">
                                    <img src={Vbucks} alt="vbucks" className="price-icon" />
                                    <span>{price}</span>
                                </div>
                                <button className="buy-btn" onClick={() => handleBuy(item.name, price)}>
                                    <FaShoppingCart /> Comprar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Loja;