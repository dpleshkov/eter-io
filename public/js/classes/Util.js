if (typeof require !== "undefined" && typeof global !== "undefined") {
    global.Vector2 = require("./Vector2").Vector2;
}

class Util {
    static distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    static circleGivenTangentPoints(p1 = new Vector2, p2 = new Vector2, r) {
        let x1 = p1.x;
        let y1 = p1.y;
        let x2 = p2.x;
        let y2 = p2.y;
        let xa = 0.5 * (x2 - x1);
        let ya = 0.5 * (y2 - y1);
        let x0 = x1 + xa;
        let y0 = y1 + ya;
        let a = Math.hypot(xa, ya);
        let b = Math.sqrt((r * r) - (a * a));
        let x3 = x0 + ((b * ya) / a);
        let y3 = y0 - ((b * xa) / a);
        let x4 = x0 - ((b * ya) / a);
        let y4 = y0 + ((b * xa) / a);
        return [new Vector2(x3, y3), new Vector2(x4, y4)];
    }

    static randInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static choose(choices) {
        let index = Math.floor(Math.random() * choices.length);
        return choices[index];
    }

    static sum(array) {
        let sum = 0;
        for (let el of array) {
            sum += el;
        }
        return sum;
    }
}

if (typeof module !== "undefined") {
    module.exports.Util = Util;
}