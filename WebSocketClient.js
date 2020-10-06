const {sleep, EventEmitter} = require('@nnnx/utils');
const WebSocket = window.WebSocket;

export class WebSocketClient extends EventEmitter {

    constructor(options) {
        super();
        this.handleConnect = this.handleConnect.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.isConnected = this.isConnected.bind(this);
        this.connect = this.connect.bind(this);
        this.close = this.close.bind(this);

        const {
            serverUrl,
            protocol,
            logMessages = false,
            autoConnect = false,
            autoReconnect = true,
            debug = false,
            timeout = 5000,
        } = options;

        this.logMessages = logMessages;
        this.debug = debug;
        this.serverUrl = serverUrl;
        this.protocol = protocol;
        this.autoReconnect = autoReconnect;
        this.reconnecting = false;
        this.timeout = timeout;

        if (autoConnect) {
            this.connect();
        }
    }

    connect() {
        if (this.serverUrl) {
            this.connection = new WebSocket(this.serverUrl, this.protocol);
        } else {
            throw Error('no serverUrl provided');
        }

        this.connection.onerror = this.handleError;
        this.connection.onclose = this.handleClose;
        this.connection.onmessage = this.handleMessage;
        this.connection.onopen = this.handleConnect;

        return new Promise((resolve, reject) => {
            if(!this.autoReconnect) {
                setTimeout(() => {
                    reject({message: `WebSocketClient failed to connect before timeout (${this.timeout}  ms)`});
                }, this.timeout);

                this.once('error', error => {
                    reject({
                        message: error.message ? error.message : 'An error occured while connecting'
                    });
                });

                this.once('disconnect', event => {
                    reject({
                        message: event.reason ? event.reason : 'A close event occured while connecting',
                        code: event.code,
                        reason: event.reason,
                    });
                });
            }

            this.once('connect', event => {
                resolve(event);
            });
        });
    }

    async disconnect() {
        await this.close();
    }

    //@todo use constants with meaningful name for readyState
    // 0	CONNECTING	Socket has been created. The connection is not yet open.
    // 1	OPEN	The connection is open and ready to communicate.
    // 2	CLOSING	The connection is in the process of closing.
    // 3	CLOSED	The connection is closed or couldn't be opened.
    async close() {
        if (this.connection.readyState === 3) {
            return;
        }

        this.connection.close();

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject({message: `WebSocketClient failed to disconnect before timeout (${this.timeout}  ms)`});
            }, this.timeout);

            this.once('disconnect', event => {
                console.log('WebSocketClient disconnected');
                resolve(event);
            });
        });
    }

    isConnected() {
        return this.connection && this.connection.readyState === 1;
    }

    handleConnect(event) {
        this.emit('connect', event);
    }

    handleError(error) {
        this.log('Connection error: ' + JSON.stringify(error));
        this.emit('error', error);

        if (this.autoReconnect) {
            this.reconnect().then();
        }
    }

    handleClose(event) {
        this.log('Connection closed: ' + JSON.stringify(event));
        this.emit('disconnect', event);

        if (this.autoReconnect) {
            this.reconnect().then();
        }

    }

    async reconnect() {
        if (this.reconnecting) {
            return;
        }

        this.log('reconnecting');
        this.reconnecting = true;
        await sleep(1000);
        this.reconnecting = false;
        this.connect();
    }

    handleMessage(message) {
        message = JSON.parse(message.data);

        if (this.logMessages) {
            console.log(message);
        }

        this.emit('message', message);
    }

    sendMessage(message) {
        if (this.connection) {
            this.connection.send(
                JSON.stringify(message));
            this.emit('message_sent', message);
            return;
        }

        throw Error('sendMessage called with no connection');
    }

    log(message) {
        if (this.debug) {
            console.log('[' + this.serverUrl + ']: ' + message);
        }
    }
}

