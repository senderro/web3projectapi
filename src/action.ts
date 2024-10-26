"use server";

import { sessionOptions, SessionData, defaultSession } from "./ironLib";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


// Função para obter a sessão atual do lado do servidor
export const getSession = async () => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }

    return session;
};

// Função para obter a sessão do lado do cliente (como string)
export const getSessionClient = async () => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }

    return JSON.stringify(session);  // Retorna sessão em formato JSON para ser usada no cliente
};

// Função de login
export const login = async (address: string) => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    // Verifique o endereço da carteira (ou outros critérios que você precise)
    if (!address) {
        return { error: "Endereço da carteira não fornecido." };
    }

    try {
       
        session.address = address;
        session.isLoggedIn = true;
        await session.save();  // Salvar a sessão

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        return { error: "Erro ao fazer login." };
    }
};

// Função de logout
export const logout = async () => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    session.destroy();  // Destruir a sessão
    

};
