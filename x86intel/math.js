/* 
 * Copyright (c) 2017, Giovanni Dante Grazioli <deroad@libero.it>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

module.exports = (function() {
    var memoryload = function(e) {
        var types = {
            'byte': 'int8_t',
            'word': 'int16_t',
            'dword': 'int32_t',
            'qword': 'int64_t'
        }
        if (types[e[1]]) {
            return "*((" + types[e[1]] + "*) " + e[2].replace(/\[|\]/g, '') + ") = " + e[3] + ";"
        } else if (types[e[2]]) {
            return e[1] + " = *((" + types[e[2]] + "*) " + e[3].replace(/\[|\]/g, '') + ");"
        }
        return null;
    };

    var commonmath = function(e, op, bits) {
        var types = {
            'byte': 'int8_t',
            'word': 'int16_t',
            'dword': 'int32_t',
            'qword': 'int64_t'
        }
        if (types[e[1]]) {
            return "*((" + types[e[1]] + "*) " + e[2].replace(/\[|\]/g, '') + ") " + op + "= " + e[3] + ";"
        } else if (types[e[2]]) {
            return e[1] + " " + op + "= *((" + types[e[2]] + "*) " + e[3].replace(/\[|\]/g, '') + ");"
        }
        return e[1] + " " + op + "= " + (bits ? '(uint' + bits + '_t) ' : '') + e[2] + ";";
    }

    var math = {
        add: function(e) {
            return commonmath(e, '+');
        },
        and: function(e) {
            return commonmath(e, '&');
        },
        lea: function(e) {
            return e[1] + " = " + e[2] + ";";
        },
        'mov': function(e) {
            if (e.length == 3) {
                return e[1] + " = " + e[2] + ";";
            }
            var m = memoryload(e);
            if (m) {
                return m;
            }
            return e[1] + " = " + e[2] + ";";
        },
        neg: function(e) {
            if (e[2].charAt(0) == '-') {
                return e[1] + " = " + e[2].substr(1, e[2].length) + ";";
            }
            return e[1] + " = -" + e[2] + ";";
        },
        nop: function(e) {
            return null;
        },
        neg: function(e) {
            return e[1] + " = !" + e[2] + ";";
        },
        or: function(e) {
            return commonmath(e, '|');
        },
        sub: function(e) {
            return memoryload(e, '-');
        },
        xor: function(e) {
            return memoryload(e, '^');
        },
        std: function(e) {
            return null;
        }
    };
    return function(l) {
        for (var i = 0; i < l.length; ++i) {
            var e = l[i].opcode;
            if (!e || typeof e != 'object') {
                continue;
            }
            if (math[e[0]]) {
                //l[i].comments.push(e.join(' '));
                l[i].opcode = math[e[0]](e);
            }
        }
        return l;
    };
})();