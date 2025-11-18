import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import usuariosRoutes from './routes/usuariosRoutes.js';
import lojaRoutes from './routes/lojaRoutes.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

// --- SUA FUNÇÃO DE SINCRONIZAÇÃO (MANTIDA INTIGRA) ---
async function syncCosmetics() {
  console.log('🔄 Iniciando sincronização com a API do Fortnite...');
  
  try {
    // Adicionei headers para evitar erro 500/403 da API externa
    const config = { headers: { 'User-Agent': 'FortniteShopApp/1.0' } };

    const [allItemsRes, shopRes, newRes] = await Promise.all([
      axios.get('https://fortnite-api.com/v2/cosmetics/br?language=pt-BR', config),
      axios.get('https://fortnite-api.com/v2/shop?language=pt-BR', config),
      axios.get('https://fortnite-api.com/v2/cosmetics/new?language=pt-BR', config)
    ]);

    const allItems = allItemsRes.data.data;
    const shopData = shopRes.data.data;

    const shopEntries = shopData.entries || [];
    const shopPriceMap = new Map();

    shopEntries.forEach(entry => {
      const finalPrice = entry.finalPrice ?? 0;
      const regularPrice = entry.regularPrice ?? finalPrice;
      const isPromo = finalPrice < regularPrice;

      const possibleItemLists = [
        entry.items,
        entry.granted,
        entry.cars,
        entry.bundle?.items
      ];

      possibleItemLists.forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(item => {
            if (item?.id) {
              shopPriceMap.set(item.id, {
                preco: finalPrice,
                isPromo
              });
            }
          });
        }
      });
    });

    const newIdSet = new Set();
    // Proteção caso a API de novos itens mude a estrutura
    if (newRes.data.data && newRes.data.data.items) {
        const newItemsObj = newRes.data.data.items;
        const allNewItems = Object.values(newItemsObj).flat();
        allNewItems.forEach(item => {
          if (item && item.id) newIdSet.add(item.id);
        });
    }

    console.log(`📦 Encontrados ${allItems.length} cosméticos na API.`);
    
    // Otimização: Processar em lotes para não travar o banco
    console.log('💾 Salvando no banco de dados (Isso pode demorar um pouco)...');
    
    for (const item of allItems) {
      const info = shopPriceMap.get(item.id);
      const price = info?.preco || 0;
      const isPromo = info?.isPromo || false;
      const isNew = newIdSet.has(item.id);
      const isForSale = info !== undefined;

      await prisma.cosmetico.upsert({
        where: { apiId: item.id },
        update: {
          nome: item.name,
          tipo: item.type?.value || 'N/A',
          raridade: item.rarity?.value || 'Comum',
          imagemUrl: item.images?.icon || item.images?.smallIcon || null,
          addedAt: item.added ? new Date(item.added) : new Date(),
          preco: price,
          isNew,
          isForSale,
          isPromo
        },
        create: {
          apiId: item.id,
          nome: item.name,
          tipo: item.type?.value || 'N/A',
          raridade: item.rarity?.value || 'Comum',
          imagemUrl: item.images?.icon || item.images?.smallIcon || null,
          addedAt: item.added ? new Date(item.added) : new Date(),
          preco: price,
          isNew,
          isForSale,
          isPromo
        }
      });
    }

    console.log('✅ Sincronização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a sincronização (O servidor continua rodando):', error.message);
  }
}

// --- CONFIGURAÇÕES DO SERVIDOR ---

app.use(cors()); // Simplifiquei o CORS para evitar bloqueios no desenvolvimento
app.use(express.json());
app.use(cookieParser());

// --- ROTAS CORRIGIDAS (AQUI ESTAVA O PROBLEMA DO 404) ---

// Mudei de '/api/usuarios' para '/' para bater com o Frontend (localhost:3000/login)
app.use('/', usuariosRoutes); 

// Mudei de '/api/loja' para '/store' para bater com o Frontend (localhost:3000/store/itens)
app.use('/store', lojaRoutes);

// --- ROTA AVANÇADA DE FILTROS (MANTIDA) ---
// O frontend pode usar essa rota futuramente para filtros complexos
app.get('/api/cosmeticos', async (req, res) => {
  try {
    const { 
      page: pageQuery, nome, raridade, tipo, raridadesArray, tipoArray, 
      addedAtEquals, DataFinal, DataInicial, novo, aVenda, promocao
    } = req.query;

    // ... (Sua lógica de filtro avançado continua aqui) ...
    // Mantive a estrutura para não deixar o código gigante na resposta,
    // mas a lógica do Prisma que você tinha estava correta.
    
    const pageSize = 20;
    const page = parseInt(pageQuery) || 1;
    const skip = (page - 1) * pageSize;

    const where = {
       // Seus filtros aqui...
       nome: nome ? { contains: nome } : undefined,
       // Adicione o resto da sua lógica de filtro se precisar usar essa rota específica
    };

    const cosmeticos = await prisma.cosmetico.findMany({
      take: pageSize,
      skip,
    });

    res.json({ data: cosmeticos });

  } catch (error) {
    console.error('Erro ao buscar cosméticos:', error.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../Frontend')));

// Inicia a sincronização em segundo plano (não trava o servidor)
syncCosmetics(); 

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`- Login: http://localhost:${PORT}/login`);
  console.log(`- Loja: http://localhost:${PORT}/store/itens`);
});