require('dotenv').config();
const express = require('express');
const convertRoutes = require('./routes/convert');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar texto ou HTML puro no body da requisição
// Subimos o limite de tamanho para 50mb para aguentar HTMLs maiores
app.use(express.text({ type: ['text/html', 'text/plain'], limit: '50mb' }));
// Middleware para processar JSON caso envie o HTML como payload JSON: { "html": "..." }
app.use(express.json({ limit: '50mb' }));

// Rotas
app.use('/convert', convertRoutes);

// Tratamento de rota não encontrada
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Wrapper (Gotenberg PDF) rodando na porta ${PORT}`);
});
