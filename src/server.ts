import cors from "cors";
import express from "express";
import disciplinasRoutes from "./routes/disciplinas.routes";
import tarefasRoutes from "./routes/tarefas.routes";
import authRoutes from "./routes/auth.routes";
import { autenticar } from "./middlewares/auth.middleware";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (_request, response) => {
  response.json({
    mensagem: "API Minha Tarefa funcionando!",
  });
});

app.use("/disciplinas", autenticar, disciplinasRoutes);
app.use("/tarefas", autenticar, tarefasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
