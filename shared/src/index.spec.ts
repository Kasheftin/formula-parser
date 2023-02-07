import { getTokenNodes, evaluateTokenNodes } from './index'

const getReferenceValue = (referenceName: string) => {
  const referenceNameLowerCase = referenceName.toLowerCase()
  if (referenceNameLowerCase === 'estimation') {
    return '4.5'
  } else if (referenceNameLowerCase === 'trackedtime') {
    return '2'
  } else if (referenceNameLowerCase.startsWith('n:') || referenceNameLowerCase.startsWith('s:')) {
    return referenceName.substring(2)
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

tests.push(['ceil(3.95, 1)', '4'])
tests.push(['ceil(3.95, 2)', '3.95'])
tests.push(['ceil(3.941, 2)', '3.95'])

tests.push(['round(3.2342, 2)', '3.23'])
tests.push(['round(3, 2)', '3'])
tests.push(['round(3.1, 2, 1)', '3.10'])

tests.push(['floor({estimation}/{trackedTime}, 1)', '2.2'])
tests.push(['ceil({estimation}/{trackedTime}, 1)', '2.3'])
tests.push(['CEIL({ESTIMATION}/{tRackEdTime}, 1)', '2.3'])
tests.push(['-5 + 1', '-4'])
tests.push(['+5 + 1', '6'])
tests.push(['-max(2,3)', '-3'])
tests.push(['+max(2,3)', '3'])
tests.push(['add(1,2,3,4)', '10'])
tests.push(['multiply(1,2,3,4)', '24'])
tests.push(['subtract(40,10,20,5)', '5'])
tests.push(['if({estimation} > 2, "Huge Estimation", "Small Estimation")', 'Huge Estimation'])
tests.push(['if({estimation} > 20, "Huge Estimation")', ''])
tests.push(['if({estimation} > 3, 5, 3) * 3', '15'])
tests.push(['if(max(+{n:1}, -{n:-2}) = 2, "ok", "fail")', 'ok'])
tests.push(['if(5 > 4, "+" : "") & 34', '+34'])
tests.push(['"5"+4', '9'])
tests.push(['(-5-(-(4-3)))', '-4'])
tests.push(['() + () - 1', '-1'])
tests.push(['max(1,2,50)', '50'])
tests.push(['min({estimation}, {trackedTime})', '2'])
tests.push(['min({estimation}, {trackedTime}, "asdasd")', 'NaN'])

describe('evaluator', () => {
  test.each(tests)('%s = %s', (formula, result) => {
    const tokenNodes = getTokenNodes(formula)
    expect(evaluateTokenNodes(tokenNodes, getReferenceValue)).toBe(result)
  })
})
