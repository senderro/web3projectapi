import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/ironLib';

export async function GET(request: Request) {
  try {
    // Obtém a sessão usando o iron-session
    const res = new Response();
    const session = await getIronSession<SessionData>(request, res, sessionOptions);

    // Verifica se o usuário está logado
    if (session.isLoggedIn && session.address) {
      return NextResponse.json({
        isLoggedIn: session.isLoggedIn,
        address: session.address,
      });
    } else {
      // Se o usuário não estiver logado, retorna um status apropriado
      return NextResponse.json(
        { message: 'Nenhuma sessão ativa encontrada.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Erro ao buscar sessão.' }, { status: 500 });
  }
}
