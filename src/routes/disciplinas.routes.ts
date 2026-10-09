import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// API-01 — Cadastrar disciplina
router.post("/", async (request, response) => {
  try {
    const { nome, cargaHoraria } = request.body ?? {};

    if (
      typeof nome !== "string" ||
      nome.trim().length === 0 ||
      !Number.isInteger(cargaHoraria) ||
      cargaHoraria <= 0
    ) {
      response.status(400).json({
        mensagem: "Informe um nome e uma carga horária válida.",
      });
      return;
    }

    const disciplina = await prisma.disciplina.create({
      data: {
        nome: nome.trim(),
        cargaHoraria,
      },
    });

    response.status(201).json(disciplina);
  } catch (error) {
    console.error("Erro ao cadastrar disciplina:", error);

    response.status(500).json({
      mensagem: "Erro interno ao cadastrar disciplina.",
    });
  }
});


// API-02 — Consultar disciplinas
router.get("/", async (_request, response) => {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      orderBy: {
        id: "asc",
      },
    });

    response.status(200).json(disciplinas);
  } catch (error) {
    console.error("Erro ao consultar disciplinas:", error);

    response.status(500).json({
      mensagem: "Erro interno ao consultar disciplinas.",
    });
  }
});



// API-03 — Editar disciplina
router.put("/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);
    const { nome, cargaHoraria } = request.body ?? {};

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        mensagem: "ID da disciplina inválido.",
      });
      return;
    }

    const disciplinaExistente = await prisma.disciplina.findUnique({
      where: { id },
    });

    if (!disciplinaExistente) {
      response.status(404).json({
        mensagem: "Disciplina não encontrada.",
      });
      return;
    }

    if (
      (nome !== undefined &&
        (typeof nome !== "string" || !nome.trim())) ||
      (cargaHoraria !== undefined &&
        (!Number.isInteger(cargaHoraria) || cargaHoraria <= 0))
    ) {
      response.status(400).json({
        mensagem: "Nome ou carga horária inválidos.",
      });
      return;
    }

    if (nome === undefined && cargaHoraria === undefined) {
      response.status(400).json({
        mensagem: "Informe pelo menos um campo para atualizar.",
      });
      return;
    }

    const disciplinaAtualizada = await prisma.disciplina.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(cargaHoraria !== undefined && { cargaHoraria }),
      },
    });

    response.status(200).json(disciplinaAtualizada);
  } catch (error) {
    console.error("Erro ao editar disciplina:", error);

    response.status(500).json({
      mensagem: "Erro interno ao editar disciplina.",
    });
  }
});



// API-04 — Excluir disciplina
router.delete("/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        mensagem: "ID da disciplina inválido.",
      });
      return;
    }

    const disciplina = await prisma.disciplina.findUnique({
      where: { id },
    });

    if (!disciplina) {
      response.status(404).json({
        mensagem: "Disciplina não encontrada.",
      });
      return;
    }

    const quantidadeTarefas = await prisma.tarefa.count({
      where: { disciplinaId: id },
    });

    if (quantidadeTarefas > 0) {
      response.status(409).json({
        mensagem: "Não é possível excluir uma disciplina com tarefas vinculadas.",
      });
      return;
    }

    await prisma.disciplina.delete({
      where: { id },
    });

    response.status(200).json({
      mensagem: "Disciplina excluída com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir disciplina:", error);

    response.status(500).json({
      mensagem: "Erro interno ao excluir disciplina.",
    });
  }
});


export default router;
