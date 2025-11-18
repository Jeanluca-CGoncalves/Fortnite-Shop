import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function Historico(req, res) {
  try {
    const usuarioId = req.userId;
    const { tipo } = req.query;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    // 🧠 Filtro condicional: COMPRA, DEVOLUCAO ou ambos
    const where = { usuarioId };
    if (tipo && (tipo === 'COMPRA' || tipo === 'DEVOLUCAO')) {
      where.tipo = tipo;
    }

    // 🔍 Busca com o cosmetico incluído
    const historico = await prisma.historicoTransacao.findMany({
      where,
      include: {
        cosmetico: {
          select: {
            nome: true,
            imagemUrl: true,
            raridade: true,
            tipo: true,
            preco: true
          }
        }
      },
      orderBy: { data: 'desc' }
    });

    if (!historico.length) {
      return res.json({ mensagem: 'Nenhuma transação encontrada.' });
    }

    // 🔧 Formata para deixar a resposta mais limpa
    const resultado = historico.map(item => ({
      id: item.id,
      tipo: item.tipo,
      valorVbucks: item.valorVbucks,
      data: item.data,
      item: item.cosmetico ? {
        nome: item.cosmetico.nome,
        imagem: item.cosmetico.imagemUrl,
        raridade: item.cosmetico.raridade,
        tipo: item.cosmetico.tipo,
        preco: item.cosmetico.preco
      } : null
    }));

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar histórico.' });
  }
}
