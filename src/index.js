require('dotenv').config();
const express = require('express');
const convertRoutes = require('./routes/convert');

const app = express();
const PORT = process.env.PORT || 3000;

// === INÍCIO DA CAMADA DE SEGURANÇA ===
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key']; // Procura o header 'x-api-key'
  const validKey = process.env.API_KEY;    // Pega a chave real do .env (Coolify)

  // Se a chave não foi enviada ou estiver incorreta, bloqueia na hora
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ error: 'Acesso negado. API Key ausente ou inválida.' });
  }
  
  next(); // Se a chave estiver certa, deixa a requisição passar!
});
// === FIM DA CAMADA DE SEGURANÇA ===

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
