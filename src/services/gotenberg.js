const axios = require('axios');
const FormData = require('form-data');

const gotenbergUrl = process.env.GOTENBERG_URL;
const gotenbergUser = process.env.GOTENBERG_USER;
const gotenbergPassword = process.env.GOTENBERG_PASSWORD;

/**
 * Converte uma string HTML em um Stream de PDF via Axios usando Gotenberg API.
 *
 * @param {string} htmlString - Conteúdo HTML literal a ser convertido
 * @returns {Promise<any>} - Um buffer stream recebido pelo axios
 */
async function convertHtmlToPdf(htmlString) {
  if (!gotenbergUrl) {
    throw new Error('Configuração GOTENBERG_URL não definida na variável de ambiente.');
  }

  const form = new FormData();
  
  // O motor Chromium do Gotenberg exige um multipart/form-data com o arquivo HTML
  // Precisamos nomear o arquivo explicitamente como 'index.html'
  form.append('files', Buffer.from(htmlString, 'utf-8'), {
    filename: 'index.html',
    contentType: 'text/html'
  });

  const options = {
    headers: {
      ...form.getHeaders()
    },
    responseType: 'stream', // Importante para não carregar o arquivo binário em memória e apenas fluir (repassar)
    timeout: 30000, // Timeout estrito de 30 segundos (tratar erro caso demore muito)
  };

  // Injecao do Basic Auth, em serviços via Coolify costumo usar os dados de usuario + senha nos headers
  if (gotenbergUser && gotenbergPassword) {
    options.auth = {
      username: gotenbergUser,
      password: gotenbergPassword
    };
  }

  // Envia a requisição
  const response = await axios.post(`${gotenbergUrl}/forms/chromium/convert/html`, form, options);

  // Retorna diretamente o Data que será gerado, e por usarmos responseType stream, é um Stream format!
  return response.data;
}

module.exports = {
  convertHtmlToPdf
};
