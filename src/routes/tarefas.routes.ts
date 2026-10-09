
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// API-05 — Cadastrar tarefa
router.post("/", async (request, response) => {
  try {
    const {
      titulo,
      descricao,
      dataEntrega,
      prioridade,
      status,
      disciplinaId,
    } = request.body ?? {};

    if (
      typeof titulo !== "string" ||
      !titulo.trim() ||
      typeof dataEntrega !== "string" ||
      !Number.isInteger(disciplinaId) ||
      disciplinaId <= 0
    ) {
      response.status(400).json({
        mensagem: "Título, data de entrega e disciplina são obrigatórios.",
      });
      return;
    }

    const data = new Date(dataEntrega);

    if (Number.isNaN(data.getTime())) {
      response.status(400).json({
        mensagem: "Data de entrega inválida.",
      });
      return;
    }

    if (
      descricao !== undefined &&
      typeof descricao !== "string"
    ) {
      response.status(400).json({
        mensagem: "Descrição inválida.",
      });
      return;
    }

    const prioridades = ["Baixa", "Media", "Alta"];
    const statusValidos = [
      "Pendente",
      "Em andamento",
      "Concluida",
    ];

    if (
      (prioridade !== undefined &&
        !prioridades.includes(prioridade)) ||
      (status !== undefined &&
        !statusValidos.includes(status))
    ) {
      response.status(400).json({
        mensagem: "Prioridade ou status inválido.",
      });
      return;
    }

    const disciplina = await prisma.disciplina.findUnique({
      where: { id: disciplinaId },
    });

    if (!disciplina) {
      response.status(404).json({
        mensagem: "Disciplina não encontrada.",
      });
      return;
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao?.trim() || null,
        dataEntrega: data,
        prioridade: prioridade ?? "Media",
        status: status ?? "Pendente",
        disciplinaId,
      },
      include: {
        disciplina: true,
      },
    });

    response.status(201).json(tarefa);
  } catch (error) {
    console.error("Erro ao cadastrar tarefa:", error);

    response.status(500).json({
      mensagem: "Erro interno ao cadastrar tarefa.",
    });
  }
});



// API-06 — Consultar tarefas
router.get("/", async (_request, response) => {
  try {
    const tarefas = await prisma.tarefa.findMany({
      include: {
        disciplina: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    response.status(200).json(tarefas);
  } catch (error) {
    console.error("Erro ao consultar tarefas:", error);

    response.status(500).json({
      mensagem: "Erro interno ao consultar tarefas.",
    });
  }
});



// API-07 — Consultar detalhes de uma tarefa
router.get("/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        mensagem: "ID da tarefa inválido.",
      });
      return;
    }

    const tarefa = await prisma.tarefa.findUnique({
      where: { id },
      include: {
        disciplina: true,
      },
    });

    if (!tarefa) {
      response.status(404).json({
        mensagem: "Tarefa não encontrada.",
      });
      return;
    }

    response.status(200).json(tarefa);
  } catch (error) {
    console.error("Erro ao consultar tarefa:", error);

    response.status(500).json({
      mensagem: "Erro interno ao consultar tarefa.",
    });
  }
});



// API-08 — Editar tarefa
router.put("/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        mensagem: "ID da tarefa inválido.",
      });
      return;
    }

    const tarefaExistente = await prisma.tarefa.findUnique({
      where: { id },
    });

    if (!tarefaExistente) {
      response.status(404).json({
        mensagem: "Tarefa não encontrada.",
      });
      return;
    }

    const {
      titulo,
      descricao,
      dataEntrega,
      prioridade,
      status,
      disciplinaId,
    } = request.body ?? {};

    if (
      (titulo !== undefined &&
        (typeof titulo !== "string" || !titulo.trim())) ||
      (descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== "string") ||
      (dataEntrega !== undefined &&
        (typeof dataEntrega !== "string" ||
          Number.isNaN(new Date(dataEntrega).getTime()))) ||
      (disciplinaId !== undefined &&
        (!Number.isInteger(disciplinaId) || disciplinaId <= 0))
    ) {
      response.status(400).json({
        mensagem: "Dados da tarefa inválidos.",
      });
      return;
    }

    const prioridades = ["Baixa", "Media", "Alta"];
    const statusValidos = [
      "Pendente",
      "Em andamento",
      "Concluida",
    ];

    if (
      (prioridade !== undefined &&
        !prioridades.includes(prioridade)) ||
      (status !== undefined &&
        !statusValidos.includes(status))
    ) {
      response.status(400).json({
        mensagem: "Prioridade ou status inválido.",
      });
      return;
    }

    if (disciplinaId !== undefined) {
      const disciplina = await prisma.disciplina.findUnique({
        where: { id: disciplinaId },
      });

      if (!disciplina) {
        response.status(404).json({
          mensagem: "Disciplina não encontrada.",
        });
        return;
      }
    }

    if (
      titulo === undefined &&
      descricao === undefined &&
      dataEntrega === undefined &&
      prioridade === undefined &&
      status === undefined &&
      disciplinaId === undefined
    ) {
      response.status(400).json({
        mensagem: "Informe pelo menos um campo para atualizar.",
      });
      return;
    }

    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo: titulo.trim() }),
        ...(descricao !== undefined && { descricao }),
        ...(dataEntrega !== undefined && {
          dataEntrega: new Date(dataEntrega),
        }),
        ...(prioridade !== undefined && { prioridade }),
        ...(status !== undefined && { status }),
        ...(disciplinaId !== undefined && { disciplinaId }),
      },
      include: {
        disciplina: true,
      },
    });

    response.status(200).json(tarefaAtualizada);
  } catch (error) {
    console.error("Erro ao editar tarefa:", error);

    response.status(500).json({
      mensagem: "Erro interno ao editar tarefa.",
    });
  }
});


export default router;
