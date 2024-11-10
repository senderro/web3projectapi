import { NextResponse } from 'next/server';
import { Client, Wallet, convertStringToHex, NFTokenMint, NFTokenCreateOffer, AccountNFToken } from 'xrpl';
import prisma from '../../../../lib/prisma';
const secretSeed = process.env.SECRET_SEED; // Seed secreta da conta do jogo (usada para mintar)

export async function POST(request: Request) {
  try {
    const { uri, recipientAddress, gameAddress } = await request.json();

    // Verificações básicas
    if (!secretSeed || !uri || !recipientAddress || !gameAddress) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    // Verificar se a quantidade de NFTs disponíveis para este gameAddress e uri é maior que 0
    const nftFromDb = await prisma.gameShopNFTs.findFirst({
      where: {
        gameAddress: gameAddress,
        uri: uri,
        quantidade: { gt: 0 }, // Verifica se a quantidade é maior que 0
      },
    });

    if (!nftFromDb) {
      return NextResponse.json({ message: 'Este NFT está esgotado ou não existe.' }, { status: 400 });
    }

    // Conectar ao XRPL Testnet
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // Criar a wallet a partir da seed
    const wallet = Wallet.fromSeed(secretSeed);

    // Mintar o NFT no XRPL
    const mintTransaction: NFTokenMint = {
      TransactionType: 'NFTokenMint',
      Account: wallet.classicAddress,
      URI: convertStringToHex(uri), // URI convertido para Hex
      Flags: 8, // Transferível
      TransferFee: 0,
      NFTokenTaxon: 0, // Taxon arbitrário
    };

    // Submeter a transação de mintagem
    await client.submitAndWait(mintTransaction, { wallet });

    // Pegar o NFTokenID do NFT mintado
    let nfts: AccountNFToken[] = [];
    let marker: string | undefined;

    do {
      const accountNFTsResponse = await client.request({
        command: 'account_nfts',
        account: wallet.classicAddress,
        limit: 400,
        marker: marker, // Usado para paginação, se houver mais resultados
      });

      nfts = nfts.concat(accountNFTsResponse.result.account_nfts);
      marker = accountNFTsResponse.result.marker as string;
    } while (marker); // Continua enquanto houver um marker para paginação

    // Procurar o NFT recém-mintado com a URI
    const mintedNFT = nfts.find(
      (nft: AccountNFToken) => nft.URI === convertStringToHex(uri)
    );

    if (!mintedNFT) {
      throw new Error('NFT recém-mintado não encontrado.');
    }

    const NFTokenID = mintedNFT.NFTokenID;

    // Criar uma oferta de transferência para o recipientAddress (preço nulo)
    const offerTransaction: NFTokenCreateOffer = {
      TransactionType: 'NFTokenCreateOffer',
      Account: wallet.classicAddress, // Conta que está criando a oferta
      NFTokenID: NFTokenID, // ID do NFT recém-mintado
      Destination: recipientAddress, // Endereço para o qual o NFT será transferido
      Amount: '0', // Transferência sem custo
      Flags: 1, // Sinaliza que é uma oferta de transferência
    };

    // Submeter a oferta de transferência
    await client.submitAndWait(offerTransaction, { wallet });

    // Desconectar do cliente XRPL
    await client.disconnect();

    // Salvar o NFT vendido na tabela SoldNFTs
    await prisma.soldNFTs.create({
      data: {
        nftID: NFTokenID,
        receiveAddress: recipientAddress,
        createByAddress: gameAddress,
        uri: uri,
      },
    });

    // Decrementar a quantidade disponível na tabela `gameShopNFTs`
    await prisma.gameShopNFTs.update({
      where: { id: nftFromDb.id }, // Atualiza o registro específico do NFT
      data: {
        quantidade: {
          decrement: 1, // Decrementa 1 da quantidade disponível
        },
      },
    });

    // Retorna sucesso com o ID do NFT recém-mintado
    return NextResponse.json({
      message: 'NFT mintado, oferta de transferência criada e quantidade atualizada com sucesso!',
      nftId: NFTokenID,
    });
  } catch (error) {
    console.error('Erro ao mintar NFT e criar oferta de transferência:', error);
    return NextResponse.json({ message: 'Erro ao mintar NFT ou criar oferta.' }, { status: 500 });
  }
}
