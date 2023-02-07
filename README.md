# Formula parser in JavaScript/Vue/React

This work is the continuation/rethink of [this great article](https://andrewstevens.dev/posts/formula-parser-in-javascript/) written by Andrew Stevens. It's based on the source code of [CodeMirror](https://codemirror.net/) and [Marked.JS](https://marked.js.org/). 

We are going to implement formula parser which supports mathematical operators, bracers, functions, comparisons, and references to other formulas and variables. The engine is pure TypeScript with few dependencies. Also this work includes 2 demos, for Vue and React, with syntax highlight and various validations (syntax, non-defined or circular refs).

### The Spec
- There's an array of items like `{id: string; title: string; estimation: number; budget: number; loggedTime: number}`.
- The output is just a table, every row is an item, and every column is item property.
- A user can add columns of type `formula` and type in equation which can refer to other columns and formulas.
- A syntax like `({budget}-{loggedTime}/3600*{pricePerHour})*0.9` should be supported.
- Math operator precedence must be in place meaning `1+2*3` should evaluate to `7`.
- Ifs and comparisons should be supported by the excel syntax, `if({a}<{b},{then},{else})`.

### Links & Demo
- https://github.com/Kasheftin/formula-parser - Source code
- https://kasheftin.github.io/formula-parser/vue/ - Vue3 Demo
- https://kasheftin.github.io/formula-parser/react/ - React Demo

## Tokenization
Formula parser consists on serveral parts. Lexer and Tokenizer are used together for the initial split. Lexer is a general iterator which processes the string from start to end. It works with any syntax. Tokenizer is a bunch of regular expressions for our specific syntax, it should find the match and move the pointer. The result is an array of tokens. Every token is just `{type: string, value: string}`. For the formula like `1+2` it is

````TypeScript
[{ type: 'Number', value: '1' }, { type: 'Operator', value: '+' }, { type: 'Number', value: '2' }]
````

It does not filter out any characters from the input meaning if we join back token values we should get the initial formula. Visually tokenization is coloring out textual input like that:

![Formula Tokenized](images/pic1.png)

Every character should be colored. We introduce quite a lot of types to simplify the future work. Tokenization is straight forward process running in one cycle without recursion. On every step it iterates over the bunch of regular expressions, the first match cuts out the matching part and repeats from the start.

The most noticeable is that we distinguish minus operator and minus as negative number part. If the previous non-whitespace token is number or closing bracket, then it's defined as operator. Otherwise it's a part of a number:

````TypeScript
const numberRegex = /^[-]?\d*\.?\d+/
if (match(numberRegex)) {
  if (['Number', 'String', 'BracketEnd', 'ReferenceBracketEnd'].includes(previousToken) && match(/^-/)) {
    return 'Operator'
  } else {
    return 'Number'
  }
}
````

At the same time, since we don't use recursion, it's hard to tell if `)` is just a bracket or it belongs to a function. That's why we do not introduce different types of brackets.

## Node Generator

We have to convert tokens into evaluation tree, which has one root node, and it's mostly binary. For the formule like `3 * 2 + 1` it should be

````TypeScript
[{
  type: 'Operator',
  value: '+',
  innerNodes: [{
    type: 'Operator',
    value: '*',
    innerNodes: [{
      type: 'Number',
      value: '2'
    }, {
      type: 'Number',
      value: '3'
    }]
  }, {
    type: 'Number',
    value: '1'
  }]
}]
````
The process looks familiar to ones who remember RPN (reverse polish notation) and [shunting yard algorithm](https://en.wikipedia.org/wiki/Shunting_yard_algorithm):
- Iterate over the meaningful tokens only (variables, operators, functions and brackets).
- If variable, check the previous token. If it's operator and it has only one child, add the current token as the second child, otherwise push it as root level item.
- If it's operator, remember the previous token, replace it with current token and then push remembered token as it's child.
- If it's a function or bracket start, cut all the tokens until the corresponding closing bracket (iterate over the brackets, every `(` adds 1, every `)` subtracts 1, until 0) and consider them as children tokens, push the current token and assign it's inner tokens as recursive call, applied to children tokens. 

Here's the full [source code](https://github.com/Kasheftin/formula-parser/shared/src/nodeGenerator.ts) of the described process covered with [tests](https://github.com/Kasheftin/formula-parser/shared/src/nodeGenerator.spec.ts).

## Operators at the begining issue

There's a small issue for formulas like `max(-round(5.5), -round(6.5))`. Minuses kind of hanging in the air, their operation nodes has only one child while subtract operation requires 2 arguments. It can be solved in several ways. We just prepend every hanging `±` operator with zero. We count `±` as hanging if there're no previous tokens or if the previous token is opening bracket or comma.

## Operator precedence

For such a simple tree generator process as described it's clear that operator precedence is not yet in place. That means `1+2*3` will be evaluated from left to right, summing will go first, the multiplication will go second, and the result will be `9` instead of `7`. To fix it we use fortran approach from [Wikipedia](https://en.wikipedia.org/wiki/Operator-precedence_parser):
- 1 bracket: prepend `^` (power operator) with `)` and append with `(`, `^` converts to `)^(`
- 2 brackets: prepend `*` and `/` with `))` and append with `((`
- 3 brackets: prepend `+` and `-` with `)))` and append with `(((`
- 4 brackets: prepend comparison operator with `))))` and append with `((((`
- 5 brackets: prepend comma with `)))))` and append with `(((((`
- 6 brackets: replace every initially existing bracket with 6 brackets of the same type
- 6 brackets: wrap the entire equation in 6 additional brackets

The idea is to prepend and append every operator with some amount of additional brackets. The bracket count should grow while going from bigger precedence to smaller one. The amount of brackets becomes quite big and hard to read, but, obviously, if the formula does not include some type of operators, we can skip it from the list and decrease the number of added brackets. Hence the formula `1+2*3` is transformed into `((1) + (2*3))`.

Here's the full [source code](https://github.com/Kasheftin/formula-parser/shared/src/operatorPrecedence.ts) of the described process covered with [tests](https://github.com/Kasheftin/formula-parser/shared/src/operatorPrecedence.spec.ts).

## Evaluation

The evaluation is straight forward. We recursivelly process the node tree and apply the corresponding operations. Worth mentioning that all the process, described above we do once per formula. We prepare node tree and cache it, and then we can calculate the formula results for many items very quickly. That's why we export 2 separate functions:
- `getTokenNodes` takes the formula and returns a token tree,
- `evaluateTokenNodes` takes the token tree and the function which should return value by reference name (getter) and calculates the result.

````TypeScript
const formula = 'floor({estimation} - {buget} * {loggedTime})'
const tokenNodes = getTokenNodes(formula)

const item = {
  id: 1,
  title: 'Sample'
  estimation: 8,
  budget: 3,
  loggedTime: 2.2
}

const getItemProperty = (propertyName: string) => (item[propertyName] || '').toString()

const result = evaluateTokenNodes(tokenNodes, getItemProperty) // returns floor(8 - 3 * 2.2) = 1
````

The full list of supported functions is specified in [supportedFunctions.ts](https://github.com/Kasheftin/formula-parser/shared/src/supportedFunctions.ts). It can be easily expanded. For the demo purpose there's an implementation of such functions as `round`, `ceil`, `floor`, `max`, `min`, `lte`, `gte` etc. Strings both in single and double quotes are also supported, but for concatination we use `&` instead of `+`. Basically, we consider every formula variable as a number, hence `"1"+"2"="3"`, `"1"+"a"="NaN"`, and `"1"&"2"="12"`. 

Many usage examples might be found in [evaluations tests](https://github.com/Kasheftin/formula-parser/shared/src/index.spec.ts).

## Syntax validation

At the first glance it seems we should use evaluation code for validation. We can try to evaluate the formula, catch the error, and attach it to the corresponding node. But there're some caveats with this approach. 
- We modify the formula quite a lot, and it becomes hard to trace back the original error location. 
- If there're several errors, we want to highlight them all. 
- Evaluation requires the reference data, it's not clear what to substitute to the evaluator.

That's why the validation process goes separately from the evaluation. And, in general, it's more strict then the evaluation itself. 

We iterate over the tokes array, and check if every token is valid. All the checks involve checking what the previous token is. We count opening/closing brackets as well. We have a strictly defined set of token types, that's why it's not hard to consider them all. For example, an operator (`±×÷^<=>`) can go only after `Number, BracketEnd, ReferenceBracketEnd, QuoteEnd, DoubleQuoteEnd`. The same time, `-(+round(5.4))` might be considered as a valid formula. Hence,

````Typescript
const operatorAllowedAfter = [
  TokenType.Number,
  TokenType.BracketEnd,
  TokenType.ReferenceBracketEnd,
  TokenType.QuoteEnd,
  TokenType.DoubleQuoteEnd
]

if (token.type === 'Operator' && !'+-'.includes(token.value)) {
  if (!prev || !operatorAllowedAfter.includes(prev.type)) {
    addError('UnexpectedOperator')
  }
}
````

The full validator code is [here](https://github.com/Kasheftin/formula-parser/shared/src/validator.ts). It's covered with [tests](https://github.com/Kasheftin/formula-parser/shared/src/validator.spec.ts).

## Circular references validation

Suppose a user can define formulas and somehow save them. Every formula can be referred from another formula by name. Then we need to validate the system against circular references. 

````TypeScript
const formulasByReferences: Record<string, string> = {
  'pricePerHour': '5',
  'totalCost': '{pricePerHour} * {loggedTime}',
  'budgetLeft': '{budget} - {totalCost}',
  'budgetLeftDecreased': '{budgetLeftDescreased} * 0.9'
  'a': '1',
  'b': '{a} + {c} + 1',
  'c': '{b} + {a}',
  'd': '{b}'
}

getCircularErrors('budgetLeft') 
// returns empty, formula is valid

getCircularErrors('budgetLeftDecreased') 
// returns circular error, formula depends on itself

getCircularErrors('b')
// returns circular error: {b} depends on {c} which depends back on {b}

getCircularErrors('d')
// returns empty: despite {d} depends on {b} which has cicular reference, {d} formula is valid by itself
````

## Wrapping things up

The last step is to consider all the defined formulas alltogether. We have to prepare all the tokens and token trees, then order formulas and validate everything. Ordering is required because we need to evaluate dependant formulas after their dependencies. Also, if a formula depends on another formula which has validation errors, it should be marked as `depends-on-invalid` itself, and it's evaluation should be skipped.   
