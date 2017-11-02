import _ from 'lodash'

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

export function compile(code)
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
