-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Seed the default login (username: Jia, password: admin@123 — bcrypt hash below).
-- Change the password from the app after first login.
INSERT INTO "User" ("id", "username", "passwordHash", "createdAt", "updatedAt")
VALUES (
  lower(hex(randomblob(16))),
  'Jia',
  '$2b$10$Py3schZfdPT7pxauWiSSaumcBglXe1cjIPrY15Pz/mic1D1cXLb/i',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
