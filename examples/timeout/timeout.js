const {WebSocketClient} = require('../../WebSocketClient');

async function run(){
    const port = 8313;
    const client = new WebSocketClient({
        serverUrl: 'ws://localhost:' + port,
        timeout: 4000,
        autoReconnect: false,
        debug: true,
    });
    const connect = await client.connect();
    const msg = "hi";
    console.log('sending message: ' + msg);
    client.sendMessage(msg);
    client.on('message', msg=>{
        console.log('received message: ' + msg);
    })
    return {
        connect,
    }
}

run().then(()=>{
    console.log('closing process succesfully');
}).catch(error=>{
    console.log(error);
});
