class Vector {
    constructor(x, y) {
        const self = this;

        self.x = x;
        self.y = y;
    }

    get direction() {
        const self = this;

        return Math.atan2(self.y, self.x);
    }

    get magnitude() {
        const self = this;

        return Math.hypot(self.y, self.x);
    }
}

if (typeof module !== "undefined") {
    module.exports.Vector = Vector;
}