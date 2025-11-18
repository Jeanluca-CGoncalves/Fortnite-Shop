-- CreateTable
CREATE TABLE "HistoricoTransacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "cosmeticoId" TEXT,
    "tipo" TEXT NOT NULL,
    "valorVbucks" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoTransacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricoTransacao_cosmeticoId_fkey" FOREIGN KEY ("cosmeticoId") REFERENCES "Cosmetico" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
