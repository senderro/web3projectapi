import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { publicAddress, tipo, password = '' } = await request.json();

    // Verifica se o publicAddress foi fornecido
    if (!publicAddress) {
      return NextResponse.json({ message: 'Endereço público não fornecido.' }, { status: 400 });
    }

    // Verifica o tipo da operação
    switch (tipo) {
      case 0: // Check Dev User
        const result1 = await prisma.devUser.findUnique({
          where: {
            publicAddress: publicAddress,
          },
        });

        if (result1) {
          return NextResponse.json({ message: 'Usuário encontrado', user: result1 }, { status: 200 });
        } else {
          return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }

      case 1: 
        const existingDevUser = await prisma.devUser.findUnique({
          where: {
            publicAddress: publicAddress,
          },
        });

        if (existingDevUser) {
          // Verifica se o usuário já está ativado
          if (existingDevUser.activated) {
            return NextResponse.json({ message: 'Usuário já está ativado.', user: existingDevUser }, { status: 200 });
          } else {
            // Se não estiver ativado, atualizamos o status de ativação
            const updatedDevUser = await prisma.devUser.update({
              where: {
                publicAddress: publicAddress,
              },
              data: {
                activated: true,
              },
            });

            return NextResponse.json({ message: 'Usuário ativado com sucesso.', user: updatedDevUser }, { status: 200 });
          }
        } else {
          // Se o devUser não existir, cria uma nova conta com ativação
          const newDevUser = await prisma.devUser.create({
            data: {
              publicAddress: publicAddress,
              password: '', // Senha padrão vazia
              activated: true, // Valor padrão de ativação
            },
          });

          return NextResponse.json({ message: 'Usuário criado e ativado com sucesso.', user: newDevUser }, { status: 200 });
        }

      case 2: // Atualizar senha do Dev User
        if (!password) {
          return NextResponse.json({ message: 'Senha não fornecida.' }, { status: 400 });
        }

        const result3 = await prisma.devUser.update({
          where: {
            publicAddress: publicAddress,
          },
          data: {
            password: password,
          },
        });

        return NextResponse.json({ message: 'Senha atualizada com sucesso.', user: result3 }, { status: 200 });

      default:
        return NextResponse.json({ message: 'Tipo de operação inválido.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return NextResponse.json({ message: 'Erro ao processar a solicitação.' }, { status: 500 });
  }
}
