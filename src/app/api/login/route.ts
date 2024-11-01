import { NextResponse } from 'next/server';
import { login } from '@/action';

export async function POST(request: Request) {
    try {
        const { address } = await request.json();
        console.log('API Login - Endereço recebido:', address);

        if (!address) {
            console.log('API Login - Endereço não fornecido');
            return NextResponse.json({ error: 'Endereço de carteira não fornecido.' }, { status: 400 });
        }

        console.log('API Login - Chamando função login...');
        const result = await login(address);
        console.log('API Login - Resultado:', result);

        if (result?.error) {
            console.log('API Login - Erro:', result.error);
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        console.log('API Login - Sucesso');
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('API Login - Erro não tratado:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
