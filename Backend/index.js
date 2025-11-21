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
const PORT = process.env.PORT || 3001;

const FRONTEND_LOCAL = "http://localhost:5173";
const FRONTEND_VERCEL = "https://fortnite-shop-zeta.vercel.app"; 
const FRONTEND_VERCEL_ALT = "https://fortnite-shop-orrub7mv7-jeanluca-cgoncalves-projects.vercel.app";

app.use(cors({
  origin: [FRONTEND_LOCAL, FRONTEND_VERCEL, FRONTEND_VERCEL_ALT],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser());

async function syncCosmetics() {
  const config = { headers: { 'User-Agent': 'FortniteShopApp/1.0' } };
  
  let allItems = [];
  let shopEntries = [];
  const newIdSet = new Set();
  
  try {
    const allItemsRes = await axios.get('https://fortnite-api.com/v2/cosmetics/br?language=pt-BR', config); 
    allItems = allItemsRes.data.data || [];
  } catch (err) {
    console.error(`Erro ao buscar Todos os Cosméticos: ${err.message}`);
  }

  try {
    const shopRes = await axios.get('https://fortnite-api.com/v2/shop?language=pt-BR', config);
    const shopData = shopRes.data.data;
    shopEntries = shopData?.entries || [];
  } catch (err) {
    console.error(`Erro ao buscar Loja: ${err.message}`);
  }

  try {
    const newRes = await axios.get('https://fortnite-api.com/v2/cosmetics/new?language=pt-BR', config);
    if (newRes.data?.data?.items) {
      Object.values(newRes.data.data.items).flat().forEach(item => {
        if (item.id) newIdSet.add(item.id);
      });
    }
  } catch (err) {
    console.error('Erro ao buscar Novos Cosméticos.');
  }

  const shopPriceMap = new Map();
  shopEntries.forEach(entry => {
    const finalPrice = entry.finalPrice ?? 0;
    const regularPrice = entry.regularPrice ?? finalPrice;
    const isPromo = finalPrice < regularPrice;

    const itemsToMap = [
      ...(entry.brItems || []),
      ...(entry.items || []), 
      ...(entry.granted || []), 
      ...(entry.cars || []), 
      ...(entry.bundle?.items || [])
    ].flat().filter(Boolean);

    itemsToMap.forEach(item => {
        if (item?.id) {
          shopPriceMap.set(item.id, { 
            preco: finalPrice, 
            precoRegular: regularPrice,
            isPromo 
          });
        }
    });
  });

  if (allItems.length > 0) {
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
  } else {
    console.warn('Sincronização ignorada: lista principal de cosméticos indisponível.');
  }
}

syncCosmetics();

app.use('/', usuariosRoutes);
app.use('/store', lojaRoutes);

app.get('/api/cosmeticos', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 500; 

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
    res.status(500).json({ erro: 'Erro ao listar cosméticos.' });
  }
});

app.get('/api/cosmeticos/filtrar', async (req, res) => {
  try {
    const { nome, tipo, raridade, inicio, fim, novo, venda, promocao } = req.query;

    const where = {};

    if (nome) where.nome = { contains: nome, mode: 'insensitive' };
    if (tipo && tipo !== 'todos') where.tipo = tipo;
    if (raridade && raridade !== 'todos') where.raridade = raridade;
    if (novo === 'true') where.isNew = true;
    if (venda === 'true') where.isForSale = true;
    if (promocao === 'true') where.isPromo = true;

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
    res.status(500).json({ erro: 'Erro ao filtrar cosméticos.' });
  }
});

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
    res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
});

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
          include: { cosmetico: true },
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

app.get('/api/tipos', async (req, res) => {
  try {
    const tipos = await prisma.cosmetico.groupBy({
      by: ['tipo'],
      _count: { tipo: true },
      where: { tipo: { not: null } },
      orderBy: { tipo: 'asc' }
    });
    
    const tiposLista = tipos
      .map(t => t.tipo)
      .filter(t => t && t !== 'N/A' && t.trim() !== '');
    
    res.json({ tipos: tiposLista });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar tipos.' });
  }
});

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../Frontend')));

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`🔓 Aceitando requisições de: ${FRONTEND_LOCAL} e VERCEL`);
});