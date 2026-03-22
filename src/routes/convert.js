const express = require('express');
const router = express.Router();
const gotenbergService = require('../services/gotenberg');

router.post('/', async (req, res, next) => {
  try {
    let htmlContent = '';

    // Verifica se recebemos como text/html ou text/plain (usando express.text)
    if (typeof req.body === 'string') {
      htmlContent = req.body;
    } 
    // Verifica se recebemos como JSON: { "html": "..." } (usando express.json)
    else if (req.body && req.body.html) {
      htmlContent = req.body.html;
    }

    if (!htmlContent || htmlContent.trim() === '') {
      return res.status(400).json({ error: 'Conteúdo HTML é obrigatório no corpo da requisição.' });
    }

    // Chama o serviço do Gotenberg aguardando o stream para repassar direto pro cliente
    const pdfStream = await gotenbergService.convertHtmlToPdf(htmlContent);

    // Configura os cabeçalhos da resposta final para reconhecer o PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"'); 
    // Caso queira forçar apenas como download e não visualização no browser, mude 'inline' para 'attachment'

    // Usa streams nativos do Node (via Axios) para enviar a resposta chunk por chunk eficientemente
    pdfStream.pipe(res);

  } catch (error) {
    console.error('Erro na rota /convert:', error.message);
    
    // Erros diretamente do serviço Gotenberg
    if (error.response) {
      console.error('Gotenberg HTTP Code:', error.response.status);
      return res.status(error.response.status).json({ 
        error: 'Erro no serviço do Gotenberg ao converter HTML', 
        details: error.message
      });
    } 
    
    // Tratamento estrito do serviço fora do ar (Timeout)
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout ao conectar com o serviço Gotenberg. O serviço demorou a responder.' });
    }
    
    // Tratamento estrito do serviço fora do ar (Connection Refused)
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(502).json({ error: 'Serviço Gotenberg está offline ou inacessível no momento.' });
    }

    res.status(500).json({ error: 'Erro interno no servidor Node wrapper', details: error.message });
  }
});

module.exports = router;
