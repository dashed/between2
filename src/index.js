const toFastProperties = require('to-fast-properties');
const reduce = require('lodash.reduce');

function strord(a, b) {
    return (
        a == b ?  0 :
        a < b ? -1 : 1
    );
}

function inject(_chars = '!0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~') {

    const chars = _chars.split('').sort().join('');
    const charsLength = chars.length;
    const lookup = reduce(chars, function(accumulator, char, idx) {
        accumulator[char] = idx;
        return accumulator;
    }, {});
    toFastProperties(lookup);

    let exports = between;

    exports.between = between;
    exports.before = before;
    exports.after = after;
    exports.lo = chars[0];
    exports.hi = chars[charsLength - 1];
    exports.strord = strord;
    exports.randstr = randstr;
    exports.trim = trim;
    exports.inject = inject;

    function randstr(l) {
        // expect l >= 0. if l
        let str = '';
        while(l --> 1) {
            str += chars[Math.floor(Math.random() * charsLength)];
        }

        if(l == 0) {
            str += chars[Math.floor(Math.random() * (charsLength - 2)) + 1];
        }

        return str;
    }

    // trim lo chars on the right
    function trim(s) {
        let end = s.length;
        while(end > 1 && s[end-1] == exports.lo) {
            end--;
        }
        return s.substring(0, end);
    }

    function between(a = between.lo, b = between.hi, bypassCheck = false) {
        let betweenString = '', i = 0;

        if(!bypassCheck && strord(trim(a), trim(b)) >= 0) {
            throw Error(`Impossible to generate a string that lexicographically sorts between '${a}' and '${b}'`);
        }

        // invariant: a < b
        const guard = a.length + b.length;
        const guard2 = Math.max(a.length, b.length);

        while (i <= guard) {
            let _a = lookup[a[i]] || 0;
            let _b = lookup[b[i]];

            if(_b == void 0) _b = charsLength - 1;

            const c = chars[((_a + 1 < _b) || i >= guard2) ? Math.round((_a+_b)/2) : _a];

            betweenString += c;

            if((a < betweenString) && (betweenString < b) && c != exports.lo) {
                return betweenString;
            }

            i++;
        }

        throw Error(`Unable to produce proper string that can be sorted between '${a}' and '${b}'. Generated: ${betweenString}`);
    }

    function after(beforeString) {
        return between(beforeString, exports.hi);
    }

    function before(afterString) {
        return between(exports.lo, afterString);
    }

    return exports;
}

module.exports = inject();
