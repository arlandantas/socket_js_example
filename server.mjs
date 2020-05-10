import net from 'net'

const clients = [], usa = [], br = []

// Cria o server e define o callback ao receber conexão
const server = net.createServer((socket) => {
  console.log("Connection received!", JSON.stringify(socket))
  socket.write('welcome!\n');

  // Registra esse client no array geral
  clients.push(socket)

  // Define o callback ao receber alguma informação nesse client
  socket.on('data', (data_buf) => {
    let data = data_buf.toString()

    // Converte o JSON recebido em objeto
    let data_obj = isJson(data)
    if (data_obj) {
      console.log("Objeto recebido em JSON: ", data_obj)

      // Caso o conteudo seja algo como: '{"funcao": "set_local", "local": "br"}'
      // Insere o cliente no devido array
      if (data_obj.funcao == 'set_local') {
        if (data_obj.local == 'br') {
          br.push(socket)
        } else if (data_obj.local == 'usa') {
          usa.push(socket)
        }
      }
    } else {
      console.log("String recebida: ", data)

      // Repassa a string para todos daquele local
      if (br.includes(socket)) {
        enviarVarios("BR: "+data, br)
      } else if (usa.includes(socket)) {
        enviarVarios("USA: "+data, usa)
      } else {
        // Se o cliente não se registrou em um local, envia para todos os clients
        enviarVarios("ALL: "+data, clients)
      }
    }
  });

  // Define o callback quando esse client for fechado
  // Aqui vemos em qual array ele está registrado e o removemos
  socket.on('close', () => {
    console.log("Client Closed!")
    if (br.includes(socket)) {
      br.splice(br.indexOf(socket), 1)
    }
    if (usa.includes(socket)) {
      usa.splice(usa.indexOf(socket), 1)
    }
    clients.splice(clients.indexOf(socket), 1)
  });
})

// Define o callback em caso de erro no servidor
server.on('error', (err) => {
  throw err;
})

// Inicia o server ouvindo na porta 8080
server.listen({ port: 8080 }, () => {
  console.log('Server no ar! Informações de conexão:', server.address());
});

// Testando se a string é um json válido e retornando seu conteudo
function isJson(str) {
  try {
      return JSON.parse(str);
  } catch (e) {
      return false;
  }
}

// Envia uma string para varios clients
function enviarVarios(data, sockets) {
  sockets.forEach(s => {
    if (!s.destroyed) {
      s.write(data)
    } else {
      console.log("Essa conexão já está fechada!")
    }
  })
}