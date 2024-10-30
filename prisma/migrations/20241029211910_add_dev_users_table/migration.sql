-- CreateTable
CREATE TABLE "MintedNFTSForUsers" (
    "id" SERIAL NOT NULL,
    "nftID" TEXT NOT NULL,
    "receiveAddress" TEXT NOT NULL,
    "createByAddress" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MintedNFTSForUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MintedNFTSForUsers_nftID_key" ON "MintedNFTSForUsers"("nftID");
