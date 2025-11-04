import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000; 

async function syncCosmetics() {
  console.log('Iniciando sincronização com a API do Fortnite...');
  
  try {
    const response = await axios.get('https://fortnite-api.com/v2/cosmetics/br?language=pt-BR');
    
    const items = response.data.data; 
    console.log(`Encontrados ${items.length} cosméticos na API.`);
    
    for (const item of items) {
   
      
      await prisma.cosmetico.upsert({
        where: { apiId: item.id }, 
        update: {
          
          nome: item.name,
          tipo: item.type?.value || 'N/A',
          raridade: item.rarity?.value || 'Comum',
          imagemUrl: item.images?.icon,
          preco: item.shopHistory ? 0 : 0, 
          addedAt: new Date(item.added),
        },
        create: {
         
          apiId: item.id,
          nome: item.name,
          tipo: item.type?.value || 'N/A',
          raridade: item.rarity?.value || 'Comum',
          imagemUrl: item.images?.icon,
          preco: 0, 
          addedAt: new Date(item.added),
        }
      });
    }
    
    console.log('Sincronização concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a sincronização:', error.message);
  }
}

app.use(cors()); 
app.use(express.json()); 
app.get('/', (req, res) => {
  res.send('Olá! Este é o backend do desafio ESO.');
});

app.get('/api/cosmeticos', async (req, res) => {

  
  try {
    const pageSize = 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * pageSize;
    const cosmeticos = await prisma.cosmetico.findMany({
        take: pageSize,
        skip: skip,
    
   // orderBy:{
   //     addedAt: desc
    //}
    })

    res.json(cosmeticos);

  } catch (error) {
    console.error('Erro ao buscar cosméticos:', error.message);
    res.status(500).json({ error: 'Erro interno ao buscar cosméticos.' });
  }
});

syncCosmetics();


app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});