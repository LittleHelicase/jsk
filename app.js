
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
    not: 'C',
    succ: ['S', 'B'],
    zero: 'F',
    one: 'O',
    and: {p: {q: ['p', 'q', 'F']}},
    or: {p: {q: ['p', 'T', 'q']}},
    isZero: {n: ['n', ['K', 'F'], 'T']},
    sub: {m: {n: ['n', 'pred', 'm']}},
    leq: {m: {n: ['isZero', ['sub', 'm', 'n']]}},
    geq: {m: {n: ['isZero', ['sub', 'n', 'm']]}},
    eq: {m: {n: ['and', ['leq', 'm', 'n'], ['geq', 'm', 'n']]}},
    pred: {n: {f: {x: ['n', {g: {h: ['h', ['g', 'f']]}}, ['K', 'x'], 'I']}}},
    two: ['succ', 'one'],
    three: ['succ', 'two'],
    add: {m: {n: {f: {x: ['m', 'f', ['n', 'f', 'x']]}}}},
    mul: 'B',
    sq: 'two',
    fac: ['Y', {f: {n: ['isZero', 'n', 'one', ['mul', 'n', ['f', ['pred', 'n']]]]}}],
    div1: {c: {n: {m: {f: {x:
        [{d: ['isZero', 'd', ['zero', 'f', 'x'], ['f', ['c', 'd', 'm', 'f', 'x']]]},
        ['sub', 'n', 'm']]
    }}}}},
    div: {n: ['Y', 'div1', ['succ', 'n']]},

    // church pair
    pair: {x: {y: {z: ['z', 'x', 'y']}}},
    first: {p: ['p', 'T']},
    second: {p: ['p', 'F']},

    // cons list
    nil: 'F',
    isNil: {l: ['l', {h: {t: {d: 'F'}}}, 'T']},
    cons: 'pair',
    head: 'first',
    tail: 'second',
    at: {n: {l: ['head', ['n', 'tail', 'l']]}}

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
    let r = n - k * k
    switch(r)
    {
        case 0: return ['sq', numeral(k)]
        case 1: return ['succ', ['sq', numeral(k)]]
        case 2: return ['succ', ['succ', ['sq', numeral(k)]]]
    }
    return ['add', ['sq', numeral(k)], numeral(r)]
}

function list(l)
{
    return _.reduceRight(l, (t, i) =>
    ['cons', i, t || 'nil'], null)
}

function at(n)
{
    return {l: _.range(n + 1).map(i => i == 0 ? 'l' : 'F')}
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
        return _.sum(_.map(code, size))
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
    if(!Array.isArray(code))
        return code
    while(true)
    {
        while(Array.isArray(code[0]))
            code = _.concat(code[0], code.slice(1))
        switch(typeof code[0])
        {
            case 'function':
                let fn = code[0]
                let args = code.splice(1, fn.length).map(exec)
                code[0] = fn.apply(null, args)
                continue
        }
        switch(code[0])
        {
            case 'I': code.shift(); continue
            case 'U': code[0] = code[1]; continue
            case 'Y': code[0] = code[1]; code[1] = ['Y', code[1]]; continue
            case 'F': code.splice(0, 2); continue
            case 'T': code.shift(); code.splice(1, 1); continue
            case 'O': code.shift(); continue
            case 'B': code.shift(); code.splice(1, 2, [code[1], code[2]]); continue
            case 'C': code.shift(); let y = code[1]; code[1] = code[2]; code[2] = y; continue
            case 'S': code.shift(); let z = code[2]; code[2] = [code[1], z]; code[1] = z; continue
        }
        switch(typeof code[0])
        {
            case 'object':
            case 'string':
                code[0] = compile(code[0])
                continue
        }
        return code.length == 1 ? code[0] : code
    }
}

console.log(JSON.stringify(exec(['eq', ['fac', numeral(5)], numeral(120), true, false])))
console.log(JSON.stringify(exec(['isNil', [numeral(9), 'tail', list(_.range(10))], true, false])))
console.log(JSON.stringify(exec(['div', numeral(100), numeral(3), n => n+1, 0])))