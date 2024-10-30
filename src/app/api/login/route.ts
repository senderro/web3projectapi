import { NextResponse } from 'next/server';
import { login } from '@/action';

export async function POST(request: Request) {
    const { address } = await request.json();

    if (!address) {
        return NextResponse.json({ error: 'Endereço de carteira não fornecido.' }, { status: 400 });
    }

    const result = await login(address);

    if (result?.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Login realizado com sucesso.' });
}
