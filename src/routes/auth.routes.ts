
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";

const router = Router();

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID não configurado no .env");
}

const googleClient = new OAuth2Client(googleClientId);

router.post("/google", async (request, response) => {
  try {
    const { credential } = request.body;

    if (typeof credential !== "string" || !credential) {
      return response.status(400).json({
        erro: "Token do Google não informado.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (
      !payload?.sub ||
      !payload.email ||
      !payload.email_verified
    ) {
      return response.status(401).json({
        erro: "Conta Google não verificada.",
      });
    }

    const usuario = await prisma.usuario.upsert({
      where: { googleId: payload.sub },
      update: {
        nome: payload.name || payload.email,
        email: payload.email,
      },
      create: {
        googleId: payload.sub,
        nome: payload.name || payload.email,
        email: payload.email,
      },
    });

    return response.status(200).json({
      mensagem: "Autenticação realizada com sucesso.",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Erro na autenticação Google:", error);

    return response.status(401).json({
      erro: "Não foi possível autenticar com Google.",
    });
  }
});

export default router;
