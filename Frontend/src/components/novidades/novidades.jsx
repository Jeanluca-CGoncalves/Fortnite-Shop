import React, { useEffect, useState } from "react";
import "../loja/Loja.css";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import Vbucks from "../../assets/vbucks.png";
import api from "../../services/api";

const Novidades = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(10000);

  // Buscar saldo
  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const response = await api.get('/privado');
        if (response.data.vbucks !== undefined) {
          setSaldo(response.data.vbucks);
        }
      } catch (err) {
        console.log('Usuário não logado');
      }
    };
    fetchSaldo();
  }, []);

  // ✅ Buscar NOVIDADES (isNew = true)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Endpoint correto: /api/cosmeticos/novos
        const response = await api.get("/api/cosmeticos/novos");
        const novos = response.data.data;

        console.log(`✅ ${novos.length} novidades encontradas!`);
        setItems(novos);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar novidades:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleBuy = async (cosmeticoId, preco, nome) => {
    if (!preco || preco === 0) {
      alert("❌ Este item não possui preço definido!");
      return;
    }

    if (preco > saldo) {
      alert(`❌ Saldo insuficiente!\n\nVocê tem: ${saldo.toLocaleString()} V-Bucks\nPrecisa de: ${preco.toLocaleString()} V-Bucks`);
      return;
    }

    if (!window.confirm(`Confirmar compra de "${nome}" por ${preco.toLocaleString()} V-Bucks?`)) {
      return;
    }

    try {
      const response = await api.post("/store/comprar", { cosmeticoId });
      alert("✅ " + response.data.mensagem);
      setSaldo(response.data.saldoAtual);
      
      // Recarregar novidades
      const res = await api.get("/api/cosmeticos/novos");
      setItems(res.data.data);
    } catch (error) {
      alert("❌ Erro: " + (error.response?.data?.erro || "Erro desconhecido"));
    }
  };

  return (
    <div className="loja-container">
      <header className="loja-header">
        <div className="header-content">
          <h1>
            <FaStar style={{ marginRight: "10px", color: "#F7E01B" }} />{" "}
            Novidades
          </h1>
          <p>Itens adicionados recentemente no Fortnite</p>
          <p style={{fontSize: '1.2rem', fontWeight: 'bold', marginTop: '10px'}}>
            💰 Saldo: {saldo.toLocaleString()} V-Bucks
          </p>
        </div>
      </header>

      <div className="loja-grid-section">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : items.length === 0 ? (
          <div style={{textAlign: 'center', padding: '50px', fontSize: '1.5rem'}}>
            Nenhuma novidade encontrada no momento.
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div
                className={`shop-card border-${item.raridade?.toLowerCase()}`}
                key={item.id}
              >
                <div className="card-image-box">
                  <img src={item.imagemUrl || 'https://via.placeholder.com/200'} alt={item.nome} />
                  <span className={`rarity-label bg-${item.raridade?.toLowerCase()}`}>
                    {item.raridade}
                  </span>

                  {/* Badge de NOVO */}
                  <div style={{position: 'absolute', top: '10px', right: '10px'}}>
                    <span style={{background: '#ffc107', color: '#000', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'}}>
                      ⭐ NOVO
                    </span>
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
            ))}
          </div>
        )}
      </div>

      <div style={{textAlign: 'center', marginTop: '30px', fontSize: '1.3rem', opacity: 0.9, background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px'}}>
        📊 Total de novidades: <strong>{items.length.toLocaleString()}</strong>
      </div>
    </div>
  );
};

export default Novidades;