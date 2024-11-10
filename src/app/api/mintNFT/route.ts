import { NextResponse } from 'next/server';
import { Client, Wallet, convertStringToHex, NFTokenMint, NFTokenCreateOffer, AccountNFToken } from 'xrpl';
import prisma from '../../../../lib/prisma';
import { IMintNFT } from '@/interfaces';
import { pinata } from '../../../../lib/pinataconfig';

const secretSeed = process.env.SECRET_SEED;

interface pinataDataMint {
      name: string,
      description: string,
      base64image: string,
      gameMetadata: Record<string, string>,
      gameAddress: string,
      timeofmint: string
}

export async function POST(request: Request) {
  try {
    const { auth, recipientAddress, base64image, name, description, gameMetadata }: IMintNFT = await request.json();
    const baseUrl = getBaseUrl(request);
    // Validação básica
    if (!secretSeed || !auth || !auth.message || !auth.signature || !auth.publicKey || !recipientAddress || !base64image || !name || !description) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }
    const gameAddress = auth.publicKey;

    const authResponse = await fetch(`${baseUrl}/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(auth),
    });

    if (authResponse.status!=200) {
      const authErrorData = await authResponse.json();
      return NextResponse.json({ message: `Authentication failed: ${authErrorData.message}` }, { status: 400 });
    }


    // Prepara os dados para envio ao Pinata
    const pinataData: pinataDataMint = {
      name,
      description,
      base64image,
      gameMetadata,
      gameAddress,
      timeofmint: new Date().toISOString(),
    };

    const mintCost = calculateMintCost(pinataData, 10000);
    const decreaseCoinsResponse = await fetch(`${baseUrl}/api/devUserDecreaseCoins/${gameAddress}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: mintCost }),
    });
    
    if (!decreaseCoinsResponse.ok) {
      const errorData = await decreaseCoinsResponse.json();
      return NextResponse.json({ message: `Erro ao debitar web3Coins: ${errorData.message}` }, { status: 400 });
    }

    // Envia o JSON para o Pinata e obtém o hash IPFS
    const pinataResponse = await pinata.upload.json(pinataData);
    const ipfsHash = pinataResponse.IpfsHash; 

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
    let nfts: AccountNFToken[] = [];
    let marker: string | undefined;

    // Continuar solicitando até que todos os NFTs sejam obtidos
    do {
      const accountNFTsResponse = await client.request({
        command: 'account_nfts',
        account: wallet.classicAddress,
        limit: 400,  // Limite máximo de NFTs por requisição
        marker: marker,  // Usado para paginação, se houver mais resultados
      });

      // Adiciona os NFTs retornados à lista
      nfts = nfts.concat(accountNFTsResponse.result.account_nfts);

      // Atualiza o marker para continuar a paginação, se houver mais NFTs
      marker = accountNFTsResponse.result.marker as string;

    } while (marker); // Continua enquanto houver um marker para paginar

    // Busca o NFT recém-mintado usando o URI convertido
    const mintedNFT = nfts.find(
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
        createByAddress: gameAddress,
        uri: ipfsHash
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

function calculateMintCost(data: pinataDataMint, bytesPerCoin: number = 100): number {
  // 1. Converte os dados para JSON
  const jsonData = JSON.stringify(data);

  // 2. Calcula o tamanho em bytes
  const dataSizeInBytes = new TextEncoder().encode(jsonData).length;

  // 3. Calcula o número de web3Coins necessários
  const costInWeb3Coins = Math.ceil(dataSizeInBytes / bytesPerCoin);

  return costInWeb3Coins;
}

function getBaseUrl(req: Request | undefined) {
  if (req) {
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    return `${protocol}://${host}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}
