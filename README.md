# Formula parser in JavaScript/Vue/React

This work is the continuation/rethink of [this great article](https://andrewstevens.dev/posts/formula-parser-in-javascript/) written by Andrew Stevens. It's based on the source code of [CodeMirror](https://codemirror.net/) and [Marked.JS](https://marked.js.org/). 

We are going to implement formula parser which supports mathematical operators, bracers, functions, and references to other formulas and variables. The engine is pure TypeScript with few dependencies. Also this work includes 2 demos, for Vue and React, with syntax highlight and various validations (syntax, non-defined or circular refs).

### The Spec
- There's an array of items like `{id: string; title: string; estimation: number; budget: number; loggedTime: number}`.
- The output is just a table, every row is an item, and every column is item property.
- A user can add columns of type `formula` and type in equation which can refer to other columns and formulas.
- A syntax like `({budget}-{loggedTime}/3600*{pricePerHour})*0.9` should be supported.
- Math operator precedence must be in place meaning `1+2*3` should evaluate to `7`.

### Links & Demo
- https://github.com/Kasheftin/formula-parser - Source code
- https://kasheftin.github.io/formula-parser/vue/ - Vue3 Demo
- https://kasheftin.github.io/formula-parser/react/ - React Demo

## Tokenization
Formula parser consists on serveral parts. Lexer and Tokenizer are used together for the initial split. Lexer is a general iterator which processes the string from start to end. It works with any syntax. Tokenizer is a bunch of regular expressions for our specific syntax, it should find the match and move the pointer. The result is an array of tokens. Every token is just `{type: string, value: string}`. For the formula like `1+2` it is

````TypeScript
[{ type: 'number', value: '1' }, { type: 'operator', value: '+' }, { type: 'number', value: '2' }]
````

It does not filter out any characters from the input meaning if we join back token values we should get the initial formula. Visually tokenization is coloring out textual input like that:

![Formula Tokenized](images/pic1.png)

Every character should be colored. We introduce quite a lot of types to simplify the future work. Tokenization is straight forward process running in one cycle without recursion. On every step it iterates over the bunch of regular expressions, the first match cuts out the matching part and repeats from the start.

The most noticeable is that we distinguish minus operator and minus as negative number part. If the previous non-whitespace token is number or closing bracket, then it's defined as operator. Otherwise it's a part of a number:

````TypeScript
const numberRegex = /^[-]?\d*\.?\d+/
if (match(numberRegex)) {
  if (['Number', 'BracketEnd', 'ReferenceBracketEnd'].includes(previousToken) && match(/^-/)) {
    return 'Operator'
  } else {
    return 'Number'
  }
}
````

At the same time, since we don't use recursion, it's hard to tell if `)` is just a bracket or it belongs to a function. That's why we do not introduce different types of brackets.

## Evaluation
https://en.wikipedia.org/wiki/Shunting_yard_algorithm

https://www.andreinc.net/2010/10/05/converting-infix-to-rpn-shunting-yard-algorithm

https://dev.to/subinedge/evaluate-reverse-polish-notation-expressions-using-javascript-algorithms-jmb
