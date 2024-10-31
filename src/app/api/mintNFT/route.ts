import { NextResponse } from 'next/server';
import { Client, Wallet, convertStringToHex, NFTokenMint, NFTokenCreateOffer, AccountNFToken } from 'xrpl';
import prisma from '../../../../lib/prisma';
import { IMintNFT } from '@/interfaces';
import { pinata } from '../../../../lib/pinataconfig';

const secretSeed = process.env.SECRET_SEED;

export async function POST(request: Request) {
  try {
    const { auth, recipientAddress, base64image, name, description, gameMetadata }: IMintNFT = await request.json();

    // Validação básica
    if (!secretSeed || !auth || !auth.message || !auth.signature || !auth.publicKey || !recipientAddress || !base64image || !name || !description) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }
    //colocar auth aqui


    // Prepara os dados para envio ao Pinata
    const pinataData = {
      name,
      description,
      base64image,
      gameMetadata,
      timeofmint: new Date().toISOString(),
    };

    // Envia o JSON para o Pinata e obtém o hash IPFS
    const pinataResponse = await pinata.upload.json(pinataData);
    const ipfsHash = pinataResponse.IpfsHash; // IPFS hash do JSON enviado

    if (!ipfsHash) {
      throw new Error('Falha ao obter o IPFS hash do Pinata.');
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
      URI: convertStringToHex(ipfsHash),
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
      (nft: AccountNFToken) => nft.URI === convertStringToHex(ipfsHash)
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


export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responde a pré-solicitação OPTIONS com um status 200
  return new NextResponse(null, { headers, status: 200 });
}
