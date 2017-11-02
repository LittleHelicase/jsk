import _ from 'lodash'
import {numeral, list} from './src/helper.mjs'
import {base} from './src/base.mjs'
import {run} from './src/execute.mjs'

// run(base, 'at', numeral(7), list(_.range(10)))
// run(base, 'eq', ['fac', numeral(5)], numeral(120), true, false)
run(base, 'fac', numeral(3), n => n + 1, 0)
run(base, 'sumRange', numeral(6), n => n + 1, 0)
run(base, 'first', list([3,1]))
run(base, 'T', 0, 1)
run(base, 'F', 0, 1)
run(base, 'isNil', 'nil', 0, 1)
run(base, 'isNil', list([]), 0, 1)
run(base, 'Y', {f: {l: ['isNil', 0, ['succ', ['f', ['tail', 'l']]]]}}, list([]), n => n + 1, 0)
run(base, 'head', list([1, 2]))
run(base, 'head', ['tail', list([numeral(1), numeral(2)])], n => n + 1, 0)
run(base, 'fold', 'add', 'zero', ['tail', list([numeral(1)])], n => n + 1, 0)
run(base, 'fold', 'add', 'zero', list([numeral(1), numeral(4), numeral(2)]), n => n + 1, 0)
// run(base, 'div', numeral(234), numeral(23), n => n+1, 0)
