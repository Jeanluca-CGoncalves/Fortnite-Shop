/*
  Warnings:

  - Added the required column `valorVbucks` to the `HistoricoTransacao` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HistoricoTransacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "cosmeticoId" TEXT,
    "tipo" TEXT NOT NULL,
    "valorVbucks" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoTransacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricoTransacao_cosmeticoId_fkey" FOREIGN KEY ("cosmeticoId") REFERENCES "Cosmetico" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_HistoricoTransacao" ("cosmeticoId", "data", "id", "tipo", "usuarioId") SELECT "cosmeticoId", "data", "id", "tipo", "usuarioId" FROM "HistoricoTransacao";
DROP TABLE "HistoricoTransacao";
ALTER TABLE "new_HistoricoTransacao" RENAME TO "HistoricoTransacao";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
