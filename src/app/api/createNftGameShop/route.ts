import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
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
    const { base64image, name, description, gameMetadata, gameAddress, quantidade, preco } = await request.json();

    // Validação básica dos campos obrigatórios
    if (!secretSeed || !gameAddress || !base64image || !name || !description) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
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

    // Enviar os dados para o Pinata e obter o IPFS hash
    const pinataResponse = await pinata.upload.json(pinataData);
    const ipfsHash = pinataResponse.IpfsHash;

    if (!ipfsHash) {
      throw new Error('Falha ao obter o IPFS hash do Pinata.');
    }

    // Criar o novo registro na tabela GameShopNFTs
    const newNFT = await prisma.gameShopNFTs.create({
      data: {
        gameAddress,
        uri: ipfsHash, // Usamos o IPFS hash como URI
        quantidade,
        preco,
      },
    });

    // Retorna sucesso com os dados do novo NFT criado
    return NextResponse.json({
      message: 'NFT criado com sucesso!',
      nft: newNFT,
    });

  } catch (error) {
    console.error('Erro ao criar NFT:', error);
    return NextResponse.json({ message: 'Erro ao criar NFT.' }, { status: 500 });
  }
}
