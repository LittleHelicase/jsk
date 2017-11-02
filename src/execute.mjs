import _ from 'lodash'
import {instructions} from './ski'
import {compile} from './compile'

export function exec(base, code)
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
            case 'function':
                let f = code.shift(), args
                if(f in instructions)
                {
                    f = instructions[f]
                    args = code.splice(0, f.length)
                }
                else
                {
                    args = code.splice(0, f.length).map((code) => exec(base, code))
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

export function run(base, ...code)
{
    console.log('EXEC \t' + JSON.stringify(code))
    console.log('===> \t' + JSON.stringify(exec(base, code)))
    console.log()
}
