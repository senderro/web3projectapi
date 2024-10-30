import { NextResponse } from 'next/server';
import { logout } from '@/action';

export async function POST() {
    await logout();  // Executa a lógica de logout
    return NextResponse.json({ message: 'Logout realizado com sucesso.' });
}
