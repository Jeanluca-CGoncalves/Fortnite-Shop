import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function Refund(req, res) { 
  try {
    const usuarioId = req.userId;
    const { itemId } = req.body; 

    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const compra = await prisma.itemComprado.findUnique({
      where: { id: itemId },
      include: { cosmetico: true }
    });

    if (!compra || compra.usuarioId !== usuarioId) {
      return res.status(404).json({ erro: "Item não encontrado ou não pertence a você." });
    }

    const item = compra.cosmetico;
    const preco = item.preco ?? 0;

    const [_, novoSaldoResult, __] = await prisma.$transaction([
      prisma.itemComprado.delete({ where: { id: compra.id } }),
      
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { vbucks: { increment: preco } }
      }),
      
      prisma.historicoTransacao.create({
        data: {
          usuarioId,
          tipo: 'DEVOLUCAO',
          valorVbucks: preco,
          cosmeticoId: item.id
        }
      })
    ]);

    res.json({
      mensagem: 'Devolução realizada com sucesso!',
      valorReembolsado: preco,
      saldoAtual: novoSaldoResult.vbucks });

  } catch (error) {
    console.error('Erro ao processar devolução:', error);
    
    return res.status(500).json({ erro: 'Erro interno ao processar devolução.' });
  }
}