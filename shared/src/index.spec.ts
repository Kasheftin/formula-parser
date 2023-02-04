import { getTokenNodes, evaluateTokenNodes } from './index'

const getPropertyValue = (param: string) => {
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
describe('evaluator', () => {
  test.each(tests)('%s = %s', (formula, result) => {
    const tokenNodes = getTokenNodes(formula)
    expect(evaluateTokenNodes(tokenNodes, getPropertyValue)).toBe(result)
  })
})
