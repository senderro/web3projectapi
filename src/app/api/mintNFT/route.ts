import { NextResponse } from 'next/server';
import { Client, Wallet, convertStringToHex, NFTokenMint, NFTokenCreateOffer, AccountNFToken } from 'xrpl';
import prisma from '../../../../lib/prisma';

const secretSeed = process.env.SECRET_SEED;
const nftURI = "https://moccasin-quickest-mongoose-160.mypinata.cloud/ipfs/QmaAQdh7fUVr9vzsfvqJKccGF2r2ZZ1DDmNp6oPaSpk2KL"; // URI estática por enquanto

export async function POST(request: Request) {
  try {
    const { recipientAddress } = await request.json();

    if (!secretSeed || !recipientAddress) {
      return NextResponse.json({ message: 'Seed ou endereço de destino não encontrado.' }, { status: 400 });
    }

    // Conecta no XRPL Testnet
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // Cria a wallet a partir da seed
    const wallet = Wallet.fromSeed(secretSeed);

    // Monta a transação de mintagem do NFT
    const mintTransaction: NFTokenMint = {
      TransactionType: 'NFTokenMint',
      Account: wallet.classicAddress,
      URI: convertStringToHex(nftURI),
      Flags: 8, // Transferível
      TransferFee: 0,
      NFTokenTaxon: 0, // Taxon arbitrário
    };

    // Envia a transação de mintagem
    await client.submitAndWait(mintTransaction, { wallet });

    // Pega o NFTokenID do NFT mintado
    const accountNFTs = await client.request({
      command: 'account_nfts',
      account: wallet.classicAddress,
    });

    const mintedNFT = accountNFTs.result.account_nfts.find(
      (nft: AccountNFToken) => nft.URI === convertStringToHex(nftURI)
    );

    if (!mintedNFT) {
      throw new Error('NFT recém-mintado não encontrado.');
    }

    const NFTokenID = mintedNFT.NFTokenID;

    // Verifica se o NFT já existe no banco de dados
    const existingNFT = await prisma.mintedNFTSForUsers.findUnique({
      where: { nftID: NFTokenID }
    });

    if (existingNFT) {
      return NextResponse.json({ message: 'NFT já foi mintado e existe no banco de dados.', nftId: NFTokenID }, { status: 400 });
    }

    // Salva os dados no banco de dados com Prisma
    await prisma.mintedNFTSForUsers.create({
      data: {
        nftID: NFTokenID,
        receiveAddress: recipientAddress,
        createByAddress: wallet.classicAddress,
      },
    });

    // 2. Criar a oferta de transferência para o endereço de destino
    const offerTransaction: NFTokenCreateOffer = {
      TransactionType: 'NFTokenCreateOffer',
      Account: wallet.classicAddress, // Conta que está criando a oferta (dona do NFT)
      NFTokenID: NFTokenID, // ID do NFT recém-mintado
      Destination: recipientAddress, // Endereço para o qual o NFT será transferido
      Amount: '0', // Transferência sem custo
      Flags: 1, // Sinaliza que é uma oferta de transferência
    };

    // Submete a oferta de transferência
    await client.submitAndWait(offerTransaction, { wallet });

    // Desconecta o cliente após o processo
    await client.disconnect();

    // Retorna sucesso com o ID do NFT recém-mintado
    return NextResponse.json({
      message: 'NFT mintado e oferta de transferência criada com sucesso!',
      nftId: NFTokenID,
    });

  } catch (error) {
    console.error('Erro ao mintar NFT e criar oferta de transferência:', error);
    return NextResponse.json({ message: 'Erro ao mintar NFT ou criar oferta.' }, { status: 500 });
  }
}
