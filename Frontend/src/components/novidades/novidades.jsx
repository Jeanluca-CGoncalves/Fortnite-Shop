import React, { useEffect, useState } from 'react';
// REAPROVEITANDO O CSS DA LOJA (Fica tudo igual!)
import '../loja/Loja.css'; 
import { FaShoppingCart, FaStar } from 'react-icons/fa'; // FaStar para novidades
import Vbucks from '../../assets/vbucks.png'; 

const Novidades = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        [cite_start]// URL DIFERENTE: Endpoint de Cosméticos Novos [cite: 29]
        const response = await fetch('https://fortnite-api.com/v2/cosmetics/new');
        const data = await response.json();
        
        // A estrutura aqui é diferente da Loja: data.data.items
        if (data.data && data.data.items) {
            setItems(data.data.items);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar novidades:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="loja-container"> {/* Usamos a mesma classe container */}
      
      <header className="loja-header">
        <div className="header-content">
            <h1><FaStar style={{marginRight: '10px', color: '#F7E01B'}}/> Novidades</h1>
            <p>Itens adicionados recentemente ao jogo</p>
        </div>
        {/* Não coloquei filtro aqui pois geralmente são poucos itens */}
      </header>

      <div className="loja-grid-section">
        {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
        ) : (
            <div className="items-grid">
                {items.map((item) => {
                    // Nas novidades, não tem preço "finalPrice" fácil na API pública
                    // Vamos simular um preço ou mostrar "Novo"
                    const rarityClass = item.rarity?.value || 'common';
                    const simulatedPrice = 1200; // Valor fixo para teste ou lógica extra

                    return (
                        <div className={`shop-card border-${rarityClass}`} key={item.id}>
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
                                    <span>{simulatedPrice}</span>
                                </div>

                                <button className="buy-btn">
                                    <FaShoppingCart /> Ver Detalhes
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

export default Novidades;