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
const PORT = 3001;

// ------------------------- CORS CONFIG -------------------------
const FRONTEND = "http://localhost:5173";

app.use(cors({
  origin: FRONTEND,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// ------------------------- MIDDLEWARES -------------------------
app.use(express.json());
app.use(cookieParser());

// ------------------------- SINCRONIZAÇÃO COM API -------------------------
async function syncCosmetics() {
  console.log('🔄 Iniciando sincronização com a API do Fortnite...');

  try {
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

      const lists = [entry.items, entry.granted, entry.cars, entry.bundle?.items];

      lists.forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(item => {
            if (item?.id) {
              shopPriceMap.set(item.id, { 
                preco: finalPrice, 
                precoRegular: regularPrice,
                isPromo 
              });
            }
          });
        }
      });
    });

    const newIdSet = new Set();
    if (newRes.data?.data?.items) {
      Object.values(newRes.data.data.items).flat().forEach(item => {
        if (item.id) newIdSet.add(item.id);
      });
    }

    console.log(`📦 Encontrados ${allItems.length} cosméticos.`);

    for (const item of allItems) {
      const info = shopPriceMap.get(item.id);

      await prisma.cosmetico.upsert({
        where: { apiId: item.id },
        update: {
          nome: item.name,
          tipo: item.type?.value || 'N/A',
          raridade: item.rarity?.value || 'Comum',
          imagemUrl: item.images?.icon || item.images?.smallIcon || null,
          addedAt: item.added ? new Date(item.added) : new Date(),
          preco: info?.preco ?? 0,
          isNew: newIdSet.has(item.id),
          isForSale: info !== undefined,
          isPromo: info?.isPromo || false
        },
        create: {
          apiId: item.id,
          nome: item.name,
          tipo: item.type?.value || 'N/A',
          raridade: item.rarity?.value || 'Comum',
          imagemUrl: item.images?.icon || item.images?.smallIcon || null,
          addedAt: item.added ? new Date(item.added) : new Date(),
          preco: info?.preco ?? 0,
          isNew: newIdSet.has(item.id),
          isForSale: info !== undefined,
          isPromo: info?.isPromo || false
        }
      });
    }

    console.log('✅ Sincronização concluída!');
  } catch (err) {
    console.error('❌ Erro de sincronização:', err.message);
  }
}

// Rode a sincronização ao iniciar
syncCosmetics();

// ------------------------- ROTAS DE USUÁRIO -------------------------
app.use('/', usuariosRoutes);
app.use('/store', lojaRoutes);

// ------------------------- LISTAGEM COMPLETA (SEM LIMITE DE 20) -------------------------
app.get('/api/cosmeticos', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 500; // AUMENTADO PARA MOSTRAR TODOS

    const total = await prisma.cosmetico.count();
    
    const data = await prisma.cosmetico.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { nome: 'asc' }
    });

    res.json({ 
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    console.error('Erro ao listar cosméticos:', err);
    res.status(500).json({ erro: 'Erro ao listar cosméticos.' });
  }
});

// ------------------------- FILTRAR COM TIPO E DATA -------------------------
app.get('/api/cosmeticos/filtrar', async (req, res) => {
  try {
    const { nome, tipo, raridade, inicio, fim, novo, venda, promocao } = req.query;

    const where = {};

    if (nome) where.nome = { contains: nome, mode: 'insensitive' };
    if (tipo && tipo !== 'todos') where.tipo = tipo; // ✅ FILTRO DE TIPO CORRIGIDO
    if (raridade && raridade !== 'todos') where.raridade = raridade;
    if (novo === 'true') where.isNew = true;
    if (venda === 'true') where.isForSale = true;
    if (promocao === 'true') where.isPromo = true;

    // ✅ FILTRO DE DATA CORRIGIDO
    if (inicio && fim) {
      where.addedAt = { 
        gte: new Date(inicio + 'T00:00:00.000Z'), 
        lte: new Date(fim + 'T23:59:59.999Z') 
      };
    } else if (inicio) {
      where.addedAt = { gte: new Date(inicio + 'T00:00:00.000Z') };
    } else if (fim) {
      where.addedAt = { lte: new Date(fim + 'T23:59:59.999Z') };
    }

    const data = await prisma.cosmetico.findMany({ 
      where,
      orderBy: { nome: 'asc' }
    });

    res.json({ data, total: data.length });
  } catch (err) {
    console.error('Erro ao filtrar:', err);
    res.status(500).json({ erro: 'Erro ao filtrar cosméticos.' });
  }
});

// ------------------------- APENAS NOVOS -------------------------
app.get('/api/cosmeticos/novos', async (req, res) => {
  try {
    const data = await prisma.cosmetico.findMany({
      where: { isNew: true },
      orderBy: { addedAt: 'desc' }
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar novos.' });
  }
});

// ------------------------- APENAS À VENDA -------------------------
app.get('/api/cosmeticos/venda', async (req, res) => {
  try {
    const data = await prisma.cosmetico.findMany({
      where: { isForSale: true },
      orderBy: { nome: 'asc' }
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar itens à venda.' });
  }
});

// ------------------------- APENAS EM PROMOÇÃO -------------------------
app.get('/api/cosmeticos/promocao', async (req, res) => {
  try {
    const data = await prisma.cosmetico.findMany({
      where: { isPromo: true },
      orderBy: { nome: 'asc' }
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar promoções.' });
  }
});

// ------------------------- DETALHES DO COSMÉTICO -------------------------
app.get('/api/cosmeticos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.cosmetico.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ erro: 'Cosmético não encontrado.' });
    }

    res.json({ item });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar detalhes.' });
  }
});

// ------------------------- PERFIL PÚBLICO PAGINADO -------------------------
app.get('/api/usuarios', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 50;

    const total = await prisma.usuario.count();

    const data = await prisma.usuario.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        vbucks: true,
        createdAt: true,
        itensComprados: {
          select: {
            id: true,
            dataCompra: true,
            cosmetico: {
              select: {
                nome: true,
                imagemUrl: true,
                raridade: true,
                tipo: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ 
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
});

// ------------------------- DETALHES PÚBLICOS DO USUÁRIO -------------------------
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        vbucks: true,
        createdAt: true,
        itensComprados: {
          include: { 
            cosmetico: true 
          },
          orderBy: { dataCompra: 'desc' }
        }
      }
    });

    if (!data) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuário.' });
  }
});

// ------------------------- TIPOS DISPONÍVEIS -------------------------
app.get('/api/tipos', async (req, res) => {
  try {
    const tipos = await prisma.cosmetico.groupBy({
      by: ['tipo'],
      _count: {
        tipo: true
      },
      where: {
        tipo: {
          not: null
        }
      },
      orderBy: {
        tipo: 'asc'
      }
    });
    
    const tiposLista = tipos
      .map(t => t.tipo)
      .filter(t => t && t !== 'N/A' && t.trim() !== '');
    
    console.log(`✅ ${tiposLista.length} tipos únicos encontrados`);
    
    res.json({ tipos: tiposLista });
  } catch (err) {
    console.error('Erro ao buscar tipos:', err);
    res.status(500).json({ erro: 'Erro ao buscar tipos.' });
  }
});

// ------------------------- RARIDADES DISPONÍVEIS -------------------------
app.get('/api/raridades', async (req, res) => {
  try {
    const raridades = await prisma.cosmetico.findMany({
      select: { raridade: true },
      distinct: ['raridade'],
      orderBy: { raridade: 'asc' }
    });
    
    res.json({ raridades: raridades.map(r => r.raridade).filter(r => r) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar raridades.' });
  }
});

// ------------------------- STATIC SERVE -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../Frontend')));

// ------------------------- START SERVER -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`🌐 Aceitando requisições de: ${FRONTEND}`);
});