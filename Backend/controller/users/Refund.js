import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function Refund(req, res) {
  try {
    const usuarioId = req.userId;
    const { itemId } = req.body;

    const item = await prisma.itemComprado.findUnique({
      where: { id: itemId },
      include: {
        cosmetico: true
      }
    });

    if (!item || item.usuarioId !== usuarioId) {
      return res.status(404).json({ erro: "Item não encontrado" });
    }

    const preco = item.cosmetico.preco || 0;

    // retorna os vbucks
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        vbucks: { increment: preco }
      }
    });

    // registra no histórico
    await prisma.historicoTransacao.create({
      data: {
        usuarioId,
        cosmeticoId: item.cosmeticoId,
        tipo: "DEVOLUCAO",
        valorVbucks: preco
      }
    });

    // remove item do inventário
    await prisma.itemComprado.delete({
      where: { id: itemId }
    });

    res.json({ ok: true, mensagem: "Item devolvido com sucesso!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao devolver item" });
  }
}
