import { executeFunction, executeOperator } from './supportedFunctions'

const tests: [string, string[], string][] = []

tests.push(['uppercase', ['Hello', ' ', 'World'], 'HELLO WORLD'])
tests.push(['lowercase', ['Hello', ' ', 'World'], 'hello world'])
tests.push(['concatenate', ['Hello', ' ', 'World'], 'Hello World'])

tests.push(['round', ['1', '2'], '1'])
tests.push(['round', ['1', '2', 'true'], '1.00'])
tests.push(['round', ['100', '2'], '100'])
tests.push(['round', ['100.121', '2'], '100.12'])
tests.push(['round', ['100.101', '2'], '100.1'])
tests.push(['round', ['100.1049', '2', 'true'], '100.10'])
tests.push(['round', ['100.105', '2', 'true'], '100.11'])
tests.push(['round', ['1.5'], '2'])
tests.push(['round', ['1.4999'], '1'])
tests.push(['round', ['1.555', '2'], '1.56'])
tests.push(['round', ['1.54999', '2'], '1.55'])
tests.push(['round', ['1.5550', '2'], '1.56'])
tests.push(['round', ['1.5551', '2'], '1.56'])
tests.push(['round', ['1.3555', '3'], '1.356'])
tests.push(['round', ['1.35551', '3'], '1.356'])
tests.push(['round', ['1.35549', '3'], '1.355'])
tests.push(['round', [], 'NaN'])

tests.push(['ceil', ['1.1'], '2'])
tests.push(['ceil', ['1.5'], '2'])
tests.push(['ceil', ['1.9'], '2'])
tests.push(['ceil', ['100', '0', 'true'], '100'])
tests.push(['ceil', ['100', '1', 'true'], '100.0'])
tests.push(['ceil', ['100.121'], '101'])
tests.push(['ceil', ['100.121', '2'], '100.13'])
tests.push(['ceil', ['100.129', '2'], '100.13'])
tests.push(['ceil', ['100.129', '5'], '100.129'])
tests.push(['ceil', ['100.129', '5', 'true'], '100.12900'])
tests.push(['ceil', [], 'NaN'])

tests.push(['floor', ['1.1'], '1'])
tests.push(['floor', ['1.5'], '1'])
tests.push(['floor', ['1.9'], '1'])
tests.push(['floor', ['100', '0', 'true'], '100'])
tests.push(['floor', ['100', '1', 'true'], '100.0'])
tests.push(['floor', ['100.121'], '100'])
tests.push(['floor', ['100.121', '2'], '100.12'])
tests.push(['floor', ['100.129', '2'], '100.12'])
tests.push(['floor', ['100.129', '5'], '100.129'])
tests.push(['floor', ['100.129', '5', 'true'], '100.12900'])
tests.push(['floor', [], 'NaN'])

tests.push(['add', ['1', '1'], '2'])
tests.push(['add', ['1.123', '1.345'], '2.468'])
tests.push(['add', ['0.1', '0.2'], '0.3'])
tests.push(['add', ['0.1', '0.1', '0.1'], '0.3'])
tests.push(['add', ['0.1349', '100.1', '0.1'], '100.3349'])
tests.push(['add', [], '0'])
tests.push(['add', ['0', 'asd'], 'NaN'])

tests.push(['multiply', [], '1'])
tests.push(['multiply', ['1', '0.1', '0.2'], '0.02'])
tests.push(['multiply', ['100', '0.1', '0.1', '1', '10'], '10'])

tests.push(['divide', [], 'NaN'])
tests.push(['divide', ['1', '0', '0.2'], 'NaN'])
tests.push(['divide', ['100', '0.1', '0.1'], '10000'])
tests.push(['divide', ['100', '0.1', '0.1', '10'], '1000'])

tests.push(['pow', [], '1'])
tests.push(['pow', ['0'], '1'])
tests.push(['pow', ['0', '1'], '0'])
tests.push(['pow', ['3', '3'], '27'])
tests.push(['pow', ['4', '0.5'], '2'])
tests.push(['pow', ['0.49', '0.5'], '0.7'])

tests.push(['max', [], 'NaN'])
tests.push(['max', ['1', '100', '-50'], '100'])
tests.push(['max', ['-1', '-2', '-560'], '-1'])

tests.push(['min', [], 'NaN'])
tests.push(['min', ['1', '100', '-50'], '-50'])
tests.push(['min', ['-1', '-2', '-560'], '-560'])

tests.push(['lt', ['0', '1'], '1'])
tests.push(['lt', ['asd', 'sdf'], '1'])
tests.push(['gt', ['0', '1'], '0'])
tests.push(['gt', ['asd', 'sdf'], '0'])
tests.push(['if', ['0', 'first', 'second'], 'second'])
tests.push(['if', ['anything except 0 and empty string', 'first', 'second'], 'first'])

tests.push(['multiply', ['invalid', 'first', 'second'], 'NaN'])
tests.push(['subtract', ['1', 'first'], 'NaN'])
tests.push(['pow', ['alpha', '2'], 'NaN'])
tests.push(['max', ['alpha', '2'], 'NaN'])
tests.push(['if', [], ''])
tests.push(['invalidFunction', [], ''])
tests.push(['gt', [], '0'])

describe('supported functions', () => {
  test.each(tests)('evaluate %s function with %s params and get %s', (functionName, params, result) => {
    expect(executeFunction(functionName, params)).toBe(result)
  })
})

describe('execute operator', () => {
  it('should execute multiply operator', () => {
    expect(executeOperator('*', ['2', '2'])).toBe('4')
  })
  it('should execute invalid operator as an empty string', () => {
    expect(executeOperator('%', ['2', '2'])).toBe('')
  })
})
