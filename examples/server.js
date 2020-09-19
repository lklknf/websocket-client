const {WebSocketServer} = require('@nnnx/websocket');

async function run(){
    const port = 8313;
    const server = new WebSocketServer({
        port,
        debug: true,
    });

    server.on('message', message =>{
        console.log('From client: ' + message);
        server.send("Hey from server");
    })
    await server.run();
    console.log('clients connected: ' + server.getClients().length);
}

run().then(()=>{
    // console.log('closing process succesfully');
}).catch(error=>{
    console.log(error);
    process.exit();
});
