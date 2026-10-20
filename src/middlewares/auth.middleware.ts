import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

type TokenPayload = {
  usuarioId: number;
};

export const autenticar: RequestHandler = (request, response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({
      erro: "Token de autenticação não informado.",
    });
    return;
  }

  const token = authorization.slice(7);

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    response.status(500).json({
      erro: "Configuração de autenticação indisponível.",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (
      typeof payload === "string" ||
      typeof payload.usuarioId !== "number"
    ) {
      response.status(401).json({
        erro: "Token de autenticação inválido.",
      });
      return;
    }

    const usuario: TokenPayload = {
      usuarioId: payload.usuarioId,
    };

    response.locals.usuarioId = usuario.usuarioId;

    next();
  } catch {
    response.status(401).json({
      erro: "Token inválido ou expirado.",
    });
  }
};
