import { NextResponse } from 'next/server';
import { Client } from "xrpl";

export async function GET(request: Request, { params }: { params: Promise<{ nft_id: string }> }) {
  const nft_id  = (await params).nft_id;

  try {
    // Conectar ao XRPL
    const client = new Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    // Solicitar ofertas de venda associadas ao NFT
    const response = await client.request({
      command: "nft_sell_offers",
      nft_id: nft_id,
      ledger_index: "validated"
    });

    // Desconectar do cliente XRPL
    await client.disconnect();

    // Verificar se há ofertas
    if (response.result.offers.length > 0) {
      return NextResponse.json({
        status: "success",
        offers: response.result.offers, // Retorna as ofertas de venda
      });
    } else {
      return NextResponse.json({
        status: "no_offers",
        message: "Nenhuma oferta de venda encontrada para este NFT.",
      });
    }

  } catch (error) {
    console.error("Erro ao buscar ofertas de venda do NFT:", error);
    return NextResponse.json({ error: "Erro ao buscar ofertas de venda do NFT" }, { status: 500 });
  }
}
