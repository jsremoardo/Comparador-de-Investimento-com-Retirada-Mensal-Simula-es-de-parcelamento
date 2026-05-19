
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 4000;
app.use(cors());
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, "estoque.json");

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return [];
  }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// GET: listar produtos
app.get("/api/produtos", (req, res) => res.json(readDB()));

// POST: cadastrar novo produto
app.post("/api/produtos", (req, res) => {
  const { descricao, valor, quantidade } = req.body;
  if (!descricao || !valor || !quantidade)
    return res.status(400).json({ error: "Campos obrigatórios" });

  const produtos = readDB();
  const novo = {
    id: Date.now().toString(),
    descricao,
    valor: Number(valor),
    quantidade: Number(quantidade),
  };
  produtos.push(novo);
  writeDB(produtos);
  res.status(201).json(novo);
});

// PUT: atualizar produto (ex: após venda)
app.put("/api/produtos/:id", (req, res) => {
  const produtos = readDB();
  const idx = produtos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Produto não encontrado" });

  produtos[idx] = { ...produtos[idx], ...req.body };
  writeDB(produtos);
  res.json(produtos[idx]);
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
