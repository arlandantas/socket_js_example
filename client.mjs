import net from 'net'

// Cria o client
const client = new net.Socket();
// Conecta ao server
client.connect(8080, '192.168.15.5', function() {
  console.log('Connected');

  // Envia uma mensagem aos server
  client.write('Hello, server! Love, Client.');

  // Inicia o contador
  startSending()

  // Depois de 5 segundos, envia ao server a string especificando um local
  setTimeout(() => {
    client.write(JSON.stringify({ funcao: 'set_local', local: 'usa' }))
  }, 5000)
});

// Define o callback ao receber uma informação do servidor
client.on('data', function(data) {
	console.log('Received: ' + data);
});

// Define o callback ao perder conexão com o servidor
client.on('close', function(data) {
	console.log('Connection closed', data);
});

// Envia uma mensagem em JSON e uma em String ao server a cada 1 segundo
let contador = 0
function startSending() {
  setInterval(() => {
    client.write(JSON.stringify({ msg_em_json: `Passaram ${++contador} segundos!` }))
    client.write(`Em string: ${contador}`)
  }, 1000)
}