import _ from 'lodash'

export function numeral(n)
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
        case 0: return ['mul', numeral(h), 'three']
        case 1: return ['succ', ['mul', numeral(h), 'three']]
        case 2: return ['succ', ['succ', ['mul', numeral(h), 'three']]]
    }
}

export function list(l)
{
    return _.reduceRight(l, (t, i) =>
    ['cons', i, t], 'nil')
}
