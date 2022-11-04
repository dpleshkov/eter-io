# eter-io

Source code for [Gamig](https://gamig.dankdmitron.dev)

### Installation & Setup

Gamig has two components — the webserver serving the site
HTML and the websocket server responsible for running
the "game" itself. The two services can be run on different machines, but 
as of now only one game server is supported. 

#### Setting up web server

```bash
git clone https://github.com/dpleshkov/eter-io.git
cd eter-io
npm install
mv .env.example .env
```

Then edit `.env` to configure port and set a websocket address
for the game server.

Run server with `npm run web`.

#### Setting up game server

```bash
git clone https://github.com/dpleshkov/eter-io.git
cd eter-io
npm install
cd engine
mv .env.example .env
```

Then edit .env to configure port and secure websocket options 
— if you wish for the server to listen using secure websockets, 
set `MODE` to `SECURE` and `CERT` and `KEY` as paths to 
your SSL certificate and key.

Run server with `npm run engine`