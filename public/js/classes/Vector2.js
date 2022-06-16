// Source: https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js
class Vector2{constructor(a=0,b=0){this.isVector2=!0,this.x=a,this.y=b}get width(){return this.x}set width(a){this.x=a}get height(){return this.y}set height(a){this.y=a}set(a,b){return this.x=a,this.y=b,this}setScalar(a){return this.x=a,this.y=a,this}setX(a){return this.x=a,this}setY(a){return this.y=a,this}setComponent(a,b){switch(a){case 0:this.x=b;break;case 1:this.y=b;break;default:throw new Error("index is out of range: "+a)}return this}getComponent(a){switch(a){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+a)}}clone(){return new this.constructor(this.x,this.y)}copy(a){return this.x=a.x,this.y=a.y,this}add(a,b){return void 0!==b?(console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(a,b)):(this.x+=a.x,this.y+=a.y,this)}addScalar(a){return this.x+=a,this.y+=a,this}addVectors(a,b){return this.x=a.x+b.x,this.y=a.y+b.y,this}addScaledVector(a,b){return this.x+=a.x*b,this.y+=a.y*b,this}sub(a,b){return void 0!==b?(console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(a,b)):(this.x-=a.x,this.y-=a.y,this)}subScalar(a){return this.x-=a,this.y-=a,this}subVectors(a,b){return this.x=a.x-b.x,this.y=a.y-b.y,this}multiply(a){return this.x*=a.x,this.y*=a.y,this}multiplyScalar(a){return this.x*=a,this.y*=a,this}divide(a){return this.x/=a.x,this.y/=a.y,this}divideScalar(a){return this.multiplyScalar(1/a)}applyMatrix3(d){let b=this.x,c=this.y,a=d.elements;return this.x=a[0]*b+a[3]*c+a[6],this.y=a[1]*b+a[4]*c+a[7],this}min(a){return this.x=Math.min(this.x,a.x),this.y=Math.min(this.y,a.y),this}max(a){return this.x=Math.max(this.x,a.x),this.y=Math.max(this.y,a.y),this}clamp(a,b){return this.x=Math.max(a.x,Math.min(b.x,this.x)),this.y=Math.max(a.y,Math.min(b.y,this.y)),this}clampScalar(a,b){return this.x=Math.max(a,Math.min(b,this.x)),this.y=Math.max(a,Math.min(b,this.y)),this}clampLength(b,c){let a=this.length();return this.divideScalar(a||1).multiplyScalar(Math.max(b,Math.min(c,a)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(a){return this.x*a.x+this.y*a.y}cross(a){return this.x*a.y-this.y*a.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){let a=Math.atan2(-this.y,-this.x)+Math.PI;return a}distanceTo(a){return Math.sqrt(this.distanceToSquared(a))}distanceToSquared(a){let b=this.x-a.x,c=this.y-a.y;return b*b+c*c}manhattanDistanceTo(a){return Math.abs(this.x-a.x)+Math.abs(this.y-a.y)}setLength(a){return this.normalize().multiplyScalar(a)}lerp(a,b){return this.x+=(a.x-this.x)*b,this.y+=(a.y-this.y)*b,this}lerpVectors(a,b,c){return this.x=a.x+(b.x-a.x)*c,this.y=a.y+(b.y-a.y)*c,this}equals(a){return a.x===this.x&&a.y===this.y}fromArray(a,b=0){return this.x=a[b],this.y=a[b+1],this}toArray(a=[],b=0){return a[b]=this.x,a[b+1]=this.y,a}fromBufferAttribute(a,b,c){return void 0!==c&&console.warn("THREE.Vector2: offset has been removed from .fromBufferAttribute()."),this.x=a.getX(b),this.y=a.getY(b),this}rotateAround(a,b){let c=Math.cos(b),d=Math.sin(b),e=this.x-a.x,f=this.y-a.y;return this.x=e*c-f*d+a.x,this.y=e*d+f*c+a.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}