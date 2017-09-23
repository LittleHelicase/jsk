
const _ = require('lodash')

const base =
{

    // uncomment to enable reductions (VERY slow):

    I: ['S', 'K', 'K'],
    F: ['K', 'I'],
    B: ['S', ['K', 'S'], 'K'],
    C: ['S', ['S', ['K', 'B'], 'S'], ['K', 'K']],

    Y: {f: [
        {x: ['f', ['x', 'x']]},
        {x: ['f', ['x', 'x']]}
    ]},
    U: [['S', 'I'], 'I'],
    K: 'T',
    not: 'C',
    succ: ['S', 'B'],
    zero: 'F',
    one: 'I',
    two: ['S', 'B', 'one'],
    three: ['S', 'B', 'two'],
    and: {p: {q: ['p', 'q', 'F']}},
    or: {p: {q: ['p', 'T', 'q']}},
    isZero: {n: ['n', ['K', 'F'], 'T']},
    sub: {m: {n: ['n', 'pred', 'm']}},
    leq: {m: {n: ['isZero', ['sub', 'm', 'n']]}},
    geq: {m: {n: ['isZero', ['sub', 'n', 'm']]}},
    eq: {m: {n: ['and', ['leq', 'm', 'n'], ['geq', 'm', 'n']]}},
    pred: {n: {f: {x: ['n', {g: {h: ['h', ['g', 'f']]}}, ['K', 'x'], 'I']}}},
    add: {m: {n: {f: {x: ['m', 'f', ['n', 'f', 'x']]}}}},
    mul: 'B',
    sq: 'two',
    fac: ['Y', {f: {n: ['isZero', 'n', 'one', ['mul', 'n', ['f', ['pred', 'n']]]]}}],
    div1: {c: {n: {m: {f: {x: ['isZero', ['sub', 'n', 'm'], 'x', ['f', ['c', ['sub', 'n', 'm'], 'm', 'f', 'x']]]}}}}},
    div: {n: ['Y', 'div1', ['succ', 'n']]},

    // church pair
    pair: {x: {y: {z: ['z', 'x', 'y']}}},
    first: {p: ['p', 'T']},
    second: {p: ['p', 'F']},

    // cons list
    nil: 'F',
    isNil: {l: ['l', {h: {t: ['K', 'F']}}, 'T']},
    cons: 'pair',
    head: 'first',
    tail: 'second',
    at: {n: {l: ['head', ['n', 'tail', 'l']]}},
    isShorterThan: {n: {l: ['isNil', ['n', 'tail', 'l']]}}

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
    switch(n - k * k)
    {
        case 0: return ['sq', numeral(k)]
        case 1: return ['succ', ['sq', numeral(k)]]
        case 2: return ['succ', ['succ', ['sq', numeral(k)]]]
    }
    let h = Math.floor(n / 3)
    switch(n - 3 * h)
    {
        case 0: return ['mul', 'three', numeral(h)]
        case 1: return ['succ', ['mul', 'three', numeral(h)]]
        case 2: return ['succ', ['succ', ['mul', 'three', numeral(h)]]]
    }
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
    return compile(f)
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
    let a = arg(code), b = body(code)
    if(a === b)
        return 'I'
    else if(!contains(b, a))
        return ['K', b]
    else if(Array.isArray(b))
    {
        if(b.length > 2)
            return fn(a, fan(b))
        else if(!contains(b[0], a))
            return ['B', b[0], fn(a, b[1])]
        else if(!contains(b[1], a))
            return ['C', fn(a, b[0]), b[1]]
        else
            return ['S', fn(a, b[0]), fn(a, b[1])]
    }
    else if(typeof b === 'object')
        return fn(a, compile(b))
}

const instructions =
{
    I: x => x,
    T: (a, b) => a,
    F: (a, b) => b,
    S: (f, g, x) => [f, x, [g, x]],
    B: (f, g, x) => [f, [g, x]],
    C: (f, x, y) => [f, y, x],
}

function exec(code)
{
    while(true)
    {
        while(Array.isArray(code[0]))
            code = _.concat(code[0], code.slice(1))
        switch(typeof code[0])
        {
            case 'object':
                code[0] = compile(code[0])
                continue
            case 'string':
                if(code[0] in base)
                {
                    code[0] = base[code[0]]
                    continue
                }
                let n = parseInt(code[0])
                if(!isNaN(n))
                {
                    code[0] = numeral(n)
                    continue
                }
            case 'function':
                let f = code.shift(), args
                if(f in instructions)
                {
                    f = instructions[f]
                    args = code.splice(0, f.length)
                }
                else
                {
                    args = code.splice(0, f.length).map(exec)
                }
                let v = f.apply(null, args)
                if(Array.isArray(v))
                    code = _.concat(v, code)
                else
                    code.splice(0, 0, v)
                continue
        }
        return code.length == 1 ? code[0] : code
    }
}

function run(...code)
{
    console.log('EXEC \t' + JSON.stringify(code))
    console.log('===> \t' + JSON.stringify(exec(code)))
    console.log()
}

run('at', '7', list(_.range(10)))
run('eq', ['fac', '5'], '120', true, false)
run('div', '234', '23', n => n+1, 0)