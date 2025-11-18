import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function MeusItens(req, res) {
  try {
    const usuarioId = req.userId;

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const itens = await prisma.itemComprado.findMany({
      where: { usuarioId },
      include: {
        cosmetico: {
          select: {
            id: true,
            nome: true,
            raridade: true,
            tipo: true,
            imagemUrl: true,
            preco: true,
          }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    const resultado = itens.map(item => ({
      idCompra: item.id,
      dataCompra: item.dataCompra,
      cosmetico: item.cosmetico
    }));

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar itens do usuário:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar itens do usuário.' });
  }
}
