import axios from 'axios';

const BuscarLoja = async (req, res) => {
    try {
        // O Servidor busca os dados na API oficial
        const response = await axios.get('https://fortnite-api.com/v2/shop/br');
        
        // E devolve para o seu Frontend
        return res.json(response.data);
    } catch (error) {
        console.error("Erro ao buscar na API do Fortnite:", error.message);
        return res.status(500).json({ message: "Erro ao buscar dados da loja." });
    }
};

export default BuscarLoja;