
const _ = require('lodash')

const base =
{

    //uncomment to enable reductions

    // I: [['S', 'K'], 'K'],
    // U: [['S', 'I'], 'I'],
    // Y: {f: [
    //     {x: ['f', ['x', 'x']]},
    //     {x: ['f', ['x', 'x']]}
    // ]},
    // T: 'K',
    // F: ['K', 'I'],
    // O: {f: {x: ['f', 'x']}},
    // B: [['S', ['K', 'S']], 'K'],
    // C: [['S', [['S', ['K', 'B']], 'S']], ['K', 'K']],

    K: 'T',
    and: {p: {q: ['p', 'q', 'F']}},
    or: {p: {q: ['p', 'T', 'q']}},
    not: 'C',
    isZero: {n: [['n', ['K', 'F']], 'T']},
    sub: {m: {n: ['n', 'pred', 'm']}},
    leq: {m: {n: ['isZero', ['sub', 'm', 'n']]}},
    eq: {m: {n: ['and', ['leq', 'm', 'n'], ['leq', 'n', 'm']]}},
    succ: ['S', 'B'],
    pred: {n: {f: {x: ['n', {g: {h: ['h', ['g', 'f']]}}, ['K', 'x'], 'I']}}},
    zero: 'F',
    one: 'O',
    two: ['succ', 'one'],
    three: ['succ', 'two'],
    add: {m: {n: {f: {x: ['m', 'f', ['n', 'f', 'x']]}}}},
    mul: 'B',
    sq: 'two',
    fac: ['Y', {f: {n: ['isZero', 'n', 'one', ['mul', 'n', ['f', ['pred', 'n']]]]}}],
}

function numeral(n)
{
    switch(n)
    {
        case 0: return 'zero'
        case 1: return 'one'
        case 2: return 'two'
        case 3: return 'three'
    }
    let k = Math.floor(Math.sqrt(n))
    let r = n % (k * k)
    switch(r)
    {
        case 0: return ['sq', numeral(k)]
        case 1: return ['succ', ['sq', numeral(k)]]
        case 2: return ['succ', ['succ', ['sq', numeral(k)]]]
    }
    return ['add', ['sq', numeral(k)], numeral(r)]
}

function arg(code)
{
    return Object.keys(code)[0]
}

function body(code)
{
    return code[arg(code)]
}

function fn(arg, body)
{
    let f = { }
    f[arg] = body
    return f
}

function size(code)
{
    if(Array.isArray(code))
        return 1 + _.sum(_.map(code, size))
    else
        return 1
}

function contains(code, fragment)
{
    if(Array.isArray(code))
        return _.some(code, c => contains(c, fragment))
    else if(typeof code === 'object')
        return contains(body(code), fragment)
    else
        return code === fragment
}

function fan(code)
{
    if(Array.isArray(code) && code.length != 2)
        return code.reduce((b, t) => b ? [b, t] : t, null)
    else
        return code
}

function compile(code)
{
    if(code in base)
        return compile(base[code])
    else if(Array.isArray(code))
        return fan(_.map(code, compile))
    else if(typeof code === 'object')
    {
        let a = arg(code), b = fan(body(code))
        if(a === b)
            return compile('I')
        else if(!contains(b, a))
            return compile(['K', b])
        else if(Array.isArray(b) && !contains(b[0], a))
            return compile(['B', b[0], fn(a, b[1])])
        else if(Array.isArray(b) && !contains(b[1], a))
            return compile(['C', fn(a, b[0]), b[1]])
        else if(Array.isArray(b))
            return compile(['S', fn(a, b[0]), fn(a, b[1])])
        else if(typeof b === 'object')
            return compile(fn(a, compile(fn(arg(b), body(b)))))
    }
    else return code
}

function exec(code)
{
    if(Array.isArray(code))
    {
        let x = code[1]
        if(typeof code[0] === 'function')
            return exec(code[0](exec(x)))
        switch(code[0])
        {
            case 'I': return exec(x)
            case 'U': return exec([x, x])
            case 'Y': return exec([x, ['Y', x]])
        }
        if(Array.isArray(code[0]))
        {
            let f = code[0][1]
            switch(code[0][0])
            {
                case 'F': return exec(x)
                case 'T': return exec(f)
                case 'O': return exec([f, x])
            }
            if(Array.isArray(code[0][0]))
            {
                let g = code[0][0][1]
                switch(code[0][0][0])
                {
                    case 'B': return exec([g, [f, x]])
                    case 'C': return exec([[g, x], f])
                    case 'S': return exec([[g, x], [f, x]])
                }
            }
        }
        let f = exec(code[0])
        if(!_.isEqual(f, code[0]))
            return exec([f, code[1]])
        // let arg = exec(code[1])
        // if(!_.isEqual(arg, code[1]))
        //     return exec([f, arg])
    }
    return code
}

let src = ['sub', numeral(125), ['fac', numeral(5)]]
let bin = compile(src)

console.log(JSON.stringify(src))
console.log(JSON.stringify(bin))
console.log(JSON.stringify(size(bin)))
console.log(JSON.stringify(exec([[bin, n => n + 1], 0])))