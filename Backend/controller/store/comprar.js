import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function Comprar(req, res) {
  try {
    const usuarioId = req.userId;

    const { cosmeticoId } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    const item = await prisma.cosmetico.findUnique({
      where: { id: cosmeticoId },
    });

    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });

    if ((item.preco ?? 0) > usuario.vbucks)
      return res.status(401).json({ erro: 'Saldo insuficiente.' });

    const jaComprou = await prisma.itemComprado.findFirst({
      where: { usuarioId: usuario.id, cosmeticoId: item.id },
    });

    if (jaComprou)
      return res.status(400).json({ erro: 'Você já possui este item.' });

    const novoSaldo = usuario.vbucks - (item.preco ?? 0);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { vbucks: novoSaldo },
    });

    await prisma.itemComprado.create({
      data: {
        usuarioId,
        cosmeticoId,
      },
    });

    await prisma.historicoTransacao.create({
      data: {
        usuarioId,
        tipo: 'COMPRA',
        valorVbucks: item.preco ?? 0,
      },
    });

    return res.json({
      mensagem: 'Compra realizada com sucesso!',
      item: item.nome,
      preco: item.preco,
      saldoAnterior: usuario.vbucks,
      saldoAtual: novoSaldo,
    });

  } catch (error) {
    console.error('Erro ao processar compra:', error);
    res.status(500).json({ erro: 'Erro interno ao processar compra.' });
  }
}
