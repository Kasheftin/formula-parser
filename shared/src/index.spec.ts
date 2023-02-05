import { getTokenNodes, evaluateTokenNodes } from './index'

const getReferenceValue = (param: string) => {
  if (param.startsWith('n:') || param.startsWith('s:')) {
    return param.substring(2)
  } else {
    return ''
  }
}

const tests: [string, string][] = []

tests.push(["'asd' & 'qwe' & 'dfg'", 'asdqwedfg'])
tests.push(['"asd" & "qwe" & {s:dfg}', 'asdqwedfg'])

tests.push(['1 + 1', '2'])
tests.push(['1 + 2 * 3', '7'])

tests.push(['1 >= 2', '0'])
tests.push(['1 <= 2', '1'])
tests.push(['{n:1}>2', '0'])
tests.push(['round(5.555, 1)', '5.6'])
tests.push(['{n:12} / {n:4} + 51 / (16 + 1)', '6'])
tests.push(['{n:12} / {n:4} + round(54 / (16 + 1), 1)', '6.2'])
tests.push(['if(1,2,3)', '2'])
tests.push(['if(1 < 2, 564, 425)', '564'])
tests.push(['if({n:1}<5,1,2)', '1'])
tests.push(['if(2^3 < 3^{n:2}, "here", "there") & \' wor"ld\'', 'here wor"ld'])
tests.push(['if(1<2,1,2)', '1'])
tests.push(['if (1<2,1,2)', '1'])
tests.push(['if(0.1 < 0.3, "correct math", "incorrect math")', 'correct math'])
tests.push(['if(0.1 + 0.2 = 0.3, "correct math", "incorrect math")', 'correct math'])
tests.push(['uppercase(if(max({n:5} ^ 2 - 3, 20, {n:17}, 30 / 4) < 16, "here", "there"))', 'THERE'])
tests.push(['max(-round(5.5), 3)', '3'])
tests.push(['min(-round(5.4) * 3, -ceil(5.5))', '-15'])
tests.push(['"1" + "2"', '3'])
tests.push(['"1" & "2"', '12'])

tests.push(['-5 + 1', '-4'])
tests.push(['+5 + 1', '6'])
tests.push(['-max(2,3)', '-3'])
tests.push(['+max(2,3)', '3'])

tests.push(['if(max(+{n:1}, -{n:-2}) = 2, "ok", "fail")', 'ok'])

tests.push(['if(5 > 4, "+" : "") & 34', '+34'])

tests.push(['"5"+4', '9'])

tests.push(['(-5-(-(4-3)))', '-4'])

tests.push(['() + () - 1', '-1'])

describe('evaluator', () => {
  test.each(tests)('%s = %s', (formula, result) => {
    const tokenNodes = getTokenNodes(formula)
    expect(evaluateTokenNodes(tokenNodes, getReferenceValue)).toBe(result)
  })
})
