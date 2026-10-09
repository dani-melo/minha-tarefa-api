
import express from "express";
import disciplinasRoutes from "./routes/disciplinas.routes";
import tarefasRoutes from "./routes/tarefas.routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    mensagem: "API Minha Tarefa funcionando!",
  });
});

app.use("/disciplinas", disciplinasRoutes);
app.use("/tarefas", tarefasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
