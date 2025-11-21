import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function ItensDeOutroUsuario(req, res) {
  try {
    const usuarioLogado = req.userId;
    const { id } = req.params;

    if (!usuarioLogado) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, email: true }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const itens = await prisma.itemComprado.findMany({
      where: { usuarioId: id },
      include: {
        cosmetico: {
          select: {
            id: true,
            nome: true,
            raridade: true,
            tipo: true,
            imagemUrl: true,
            preco: true
          }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    const resultado = {
      usuario: usuario.email,
      totalItens: itens.length,
      itens: itens.map(item => ({
        idCompra: item.id,
        dataCompra: item.dataCompra,
        cosmetico: item.cosmetico
      }))
    };

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar itens de outro usuário:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar itens do usuário.' });
  }
}
