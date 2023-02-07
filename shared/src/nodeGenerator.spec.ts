import { TokenType, TokenNode } from './types'
import { NodeGenerator } from './nodeGenerator'
import { Lexer } from './lexer'
import { Tokenizer } from './tokenizer'
import { FixOperatorsAtTheBegining } from './operatorPrecedence'

const tests: [string, TokenNode[]][] = []

tests.push(['2*3+1', [{
  type: TokenType.Operator,
  value: '+',
  innerNodes: [{
    type: TokenType.Operator,
    value: '*',
    innerNodes: [{
      type: TokenType.Number,
      value: '2',
      innerNodes: []
    }, {
      type: TokenType.Number,
      value: '3',
      innerNodes: []
    }]
  }, {
    type: TokenType.Number,
    value: '1',
    innerNodes: []
  }]
}]])

tests.push(['round(5.5, 2)  - {field}', [{
  type: TokenType.Operator,
  value: '-',
  innerNodes: [{
    type: TokenType.FunctionName,
    value: 'round',
    innerNodes: [{
      type: TokenType.Number,
      value: '5.5',
      innerNodes: []
    }, {
      type: TokenType.Number,
      value: '2',
      innerNodes: []
    }]
  }, {
    type: TokenType.ReferenceName,
    value: 'field',
    innerNodes: []
  }]
}]])

tests.push(['-sin({f}*(5+{g}))', [{
  type: TokenType.Operator,
  value: '-',
  innerNodes: [{
    type: TokenType.Number,
    value: '0',
    innerNodes: []
  }, {
    type: TokenType.FunctionName,
    value: 'sin',
    innerNodes: [{
      type: TokenType.Operator,
      value: '*',
      innerNodes: [{
        type: TokenType.ReferenceName,
        value: 'f',
        innerNodes: []
      }, {
        type: TokenType.Group,
        value: '',
        innerNodes: [{
          type: TokenType.Operator,
          value: '+',
          innerNodes: [{
            type: TokenType.Number,
            value: '5',
            innerNodes: []
          }, {
            type: TokenType.ReferenceName,
            value: 'g',
            innerNodes: []
          }]
        }]
      }]
    }]
  }]
}]])

tests.push(['1+-2ss', [{
  type: TokenType.Operator,
  value: '-',
  innerNodes: [{
    type: TokenType.Operator,
    value: '+',
    innerNodes: [{
      type: TokenType.Number,
      value: '1',
      innerNodes: []
    }, {
      type: TokenType.Number,
      value: '0',
      innerNodes: []
    }]
  }, {
    type: TokenType.Number,
    value: '2',
    innerNodes: []
  }]
}]])

tests.push(['5.,', [{
  type: TokenType.Number,
  value: '5',
  innerNodes: []
}]])

tests.push(['-5.,', [{
  type: TokenType.Operator,
  value: '-',
  innerNodes: [{
    type: TokenType.Number,
    value: '0',
    innerNodes: []
  }, {
    type: TokenType.Number,
    value: '5',
    innerNodes: []
  }]
}]])

tests.push(['-{f}+sdf()', [{
  type: TokenType.Operator,
  value: '+',
  innerNodes: [{
    type: TokenType.Operator,
    value: '-',
    innerNodes: [{
      type: TokenType.Number,
      value: '0',
      innerNodes: []
    }, {
      type: TokenType.ReferenceName,
      value: 'f',
      innerNodes: []
    }]
  }, {
    type: TokenType.FunctionName,
    value: 'sdf',
    innerNodes: []
  }]
}]])

tests.push(['({field} - round(5.5)) * 2 + -1', [{
  type: TokenType.Operator,
  value: '-',
  innerNodes: [{
    type: TokenType.Operator,
    value: '+',
    innerNodes: [{
      type: TokenType.Operator,
      value: '*',
      innerNodes: [{
        type: TokenType.Group,
        value: '',
        innerNodes: [{
          type: TokenType.Operator,
          value: '-',
          innerNodes: [{
            type: TokenType.ReferenceName,
            value: 'field',
            innerNodes: []
          }, {
            type: TokenType.FunctionName,
            value: 'round',
            innerNodes: [{
              type: TokenType.Number,
              value: '5.5',
              innerNodes: []
            }]
          }]
        }]
      }, {
        type: TokenType.Number,
        value: '2',
        innerNodes: []
      }]
    }, {
      type: TokenType.Number,
      value: '0',
      innerNodes: []
    }]
  }, {
    type: TokenType.Number,
    value: '1',
    innerNodes: []
  }]
}]])

tests.push(['', []])
tests.push(['f1((f2(4,2) - f3(f4({r1})-f5())), 2, "", "asd({qw\\"e})")', [{
  type: TokenType.FunctionName,
  value: 'f1',
  innerNodes: [{
    type: TokenType.Group,
    value: '',
    innerNodes: [{
      type: TokenType.Operator,
      value: '-',
      innerNodes: [{
        type: TokenType.FunctionName,
        value: 'f2',
        innerNodes: [{
          type: TokenType.Number,
          value: '4',
          innerNodes: []
        }, {
          type: TokenType.Number,
          value: '2',
          innerNodes: []
        }]
      }, {
        type: TokenType.FunctionName,
        value: 'f3',
        innerNodes: [{
          type: TokenType.Operator,
          value: '-',
          innerNodes: [{
            type: TokenType.FunctionName,
            value: 'f4',
            innerNodes: [{
              type: TokenType.ReferenceName,
              value: 'r1',
              innerNodes: []
            }]
          }, {
            type: TokenType.FunctionName,
            value: 'f5',
            innerNodes: []
          }]
        }]
      }]
    }]
  }, {
    type: TokenType.Number,
    value: '2',
    innerNodes: []
  }, {
    type: TokenType.String,
    value: '',
    innerNodes: []
  }, {
    type: TokenType.String,
    value: 'asd({qw\\"e})',
    innerNodes: []
  }]
}]])

tests.push(['if({n:1}<5,1,2)', [{
  type: TokenType.FunctionName,
  value: 'if',
  innerNodes: [{
    type: TokenType.Operator,
    value: '<',
    innerNodes: [{
      type: TokenType.ReferenceName,
      value: 'n:1',
      innerNodes: []
    }, {
      type: TokenType.Number,
      value: '5',
      innerNodes: []
    }]
  }, {
    type: TokenType.Number,
    value: '1',
    innerNodes: []
  }, {
    type: TokenType.Number,
    value: '2',
    innerNodes: []
  }]
}]])

tests.push(['if (1<2,3,4)', [{
  type: TokenType.FunctionName,
  value: 'if',
  innerNodes: [{
    type: TokenType.Operator,
    value: '<',
    innerNodes: [{
      type: TokenType.Number,
      value: '1',
      innerNodes: []
    }, {
      type: TokenType.Number,
      value: '2',
      innerNodes: []
    }]
  }, {
    type: TokenType.Number,
    value: '3',
    innerNodes: []
  }, {
    type: TokenType.Number,
    value: '4',
    innerNodes: []
  }]
}]])

tests.push(['round((5))', [{
  type: TokenType.FunctionName,
  value: 'round',
  innerNodes: [{
    type: TokenType.Group,
    value: '',
    innerNodes: [{
      type: TokenType.Number,
      value: '5',
      innerNodes: []
    }]
  }]
}]])

describe('NodeGenerator(Lexer(formula, Tokenizer))', () => {
  test.each(tests)('should split %s to tokens correctly and generate binary tree', (formula, tokenNodes) => {
    const result = NodeGenerator(FixOperatorsAtTheBegining(Lexer(formula, Tokenizer)))
    expect(result).toEqual(tokenNodes)
  })
})
