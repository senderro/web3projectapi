-- CreateTable
CREATE TABLE "MintedNFTSForUsers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nftID" TEXT NOT NULL,
    "receiveAddress" TEXT NOT NULL,
    "createByAddress" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DevUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicAddress" TEXT NOT NULL,
    "activated" BOOLEAN DEFAULT false,
    "password" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MintedNFTSForUsers_nftID_key" ON "MintedNFTSForUsers"("nftID");

-- CreateIndex
CREATE UNIQUE INDEX "DevUser_publicAddress_key" ON "DevUser"("publicAddress");
