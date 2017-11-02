export const base =
{

    // uncomment to enable reductions (VERY slow):

    // I: ['S', 'K', 'K'],
    // F: ['K', 'I'],
    // B: ['S', ['K', 'S'], 'K'],
    // C: ['S', ['S', ['K', 'B'], 'S'], ['K', 'K']],

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
    sumRange: ['Y', {f: {n: ['isZero', 'n', 'zero', ['add', 'n', ['f', ['pred', 'n']]]]}}],
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
    isShorterThan: {n: {l: ['isNil', ['n', 'tail', 'l']]}},

    fold: {itFn: {init: ['Y', {f: {list: ['isNil', 'list', 'init', ['itFn', ['f', ['tail', 'list']], ['head', 'list']]]}}]}},
}
