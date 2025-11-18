import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function Devolver(req, res) {
  try {
    const usuarioId = req.userId;
    const { cosmeticoId } = req.body;

    // 1️⃣ Verificar se o usuário está logado
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    // 2️⃣ Buscar a compra no banco
    const compra = await prisma.itemComprado.findFirst({
      where: {
        usuarioId,
        cosmeticoId
      },
      include: {
        cosmetico: true
      }
    });

    if (!compra) {
      return res.status(404).json({ erro: 'Este item não foi comprado por você.' });
    }

    const item = compra.cosmetico;

    // 3️⃣ Deletar o item comprado
    await prisma.itemComprado.delete({
      where: { id: compra.id }
    });

    // 4️⃣ Reembolsar o valor
    const novoSaldo = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        vbucks: { increment: item.preco ?? 0 }
      }
    });

    // 5️⃣ Registrar no histórico
    await prisma.historicoTransacao.create({
      data: {
        usuarioId,
        tipo: 'DEVOLUCAO',
        valorVbucks: item.preco ?? 0,
        cosmeticoId
      }
    });

    res.json({
      mensagem: 'Devolução realizada com sucesso!',
      item: item.nome,
      valorReembolsado: item.preco ?? 0,
      saldoAtual: novoSaldo.vbucks
    });

  } catch (error) {
    console.error('Erro ao processar devolução:', error);
    res.status(500).json({ erro: 'Erro interno ao processar devolução.' });
  }
}
