import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listarInventario(req, res) {
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
      id: item.id,      dataCompra: item.dataCompra,
      cosmetico: item.cosmetico,
    }));

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar itens do usuário:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar itens do usuário.' });
  }
}

export async function verInventarioOutroUsuario(req, res) {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        email: true,
        itensComprados: {
          include: { cosmetico: { select: { nome: true, imagemUrl: true, raridade: true } } }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar inventário de outro usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar inventário.' });
  }
}