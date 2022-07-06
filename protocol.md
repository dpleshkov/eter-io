# Protocol


Message Types:
```
Client -> Server:

223 - WASD movement update. 
First four bits of second byte correspond to 
D, A, W, and S, respectively.

223 - Request to fire. Next two bytes indicate
an angle between 0 and 65535. To convert to radians,
angle / 65536 * 2 * Math.PI. 

225 - Ping. Response of 226 is expected.

Server -> Client:

36 - Circle obstacle info

37 - detailed player entity info

38 - Projectile entity info

226 - Pong. Issued in response to 225.

```