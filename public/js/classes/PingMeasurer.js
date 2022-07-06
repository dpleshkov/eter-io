class PingMeasurer {
    constructor(socket, multiplayerAgent) {
        const self = this;

        self.multiplayerAgent = multiplayerAgent;

        self.socket = socket;
        self.lastSentPing = Date.now();
        self.pingMeasurements = [];
        self.ping = 0;
        self.sendPing();
        self.socket.addEventListener("message", async(evt) => {
            if (typeof evt.data === "object") {
                let buf = await evt.data.arrayBuffer();
                let view = new DataView(buf);
                if (view.getUint8(0) === 226) {
                    self.pingMeasurements.unshift(Date.now() - self.lastSentPing);
                    if (self.pingMeasurements.length > 10) self.pingMeasurements.pop();
                    self.ping = Math.round(Util.sum(self.pingMeasurements) / self.pingMeasurements.length);
                    if (self.multiplayerAgent.lagCompensationMode === "one way") {
                        window.pingMeasurement = Math.ceil(self.ping / 2);
                    } else {
                        window.pingMeasurement = self.ping;
                    }
                    setTimeout(() => {
                        self.sendPing();
                    }, 250);
                }
            }
        });
    }

    sendPing() {
        const self = this;

        self.lastSentPing = Date.now();
        self.socket.send(self._getPingBuffer());
    }

    _getPingBuffer() {
        let buffer = new ArrayBuffer(1);
        let view = new DataView(buffer);
        view.setUint8(0, 225);
        return buffer;
    }
}