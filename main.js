var _ = require('underscore');
var esprima = require('esprima');
var estraverse = require('estraverse');

var currentCode = '';

function expressionDepthOf(expression) {
    var childDepths = _.map(expression, function(child, key) {
        if (!child.hasOwnProperty('type')) return 0;
        if (!isExpression(child)) return 0;
        return 1 + expressionDepthOf(child);
    });

    if (_.isEmpty(childDepths)) return 1;
    return 1 + _.max(childDepths);
}

function isExpression(node) {
    return /Expression$/.test(node.type)
}

function hasCurlyBraces(statement) {
    return /^\s*\{/.test(getSnippet(statement));
}

function wrapString(str, wrapper) {
    return wrapper + str + wrapper
}

function getSnippet(node, useMarkdown) {
    var snippet = currentCode.substring(node.range[0], node.range[1]);
    return wrapString(snippet, useMarkdown ? '```' : '')
}

function isSingleLine(node) {
    return node.loc.start.line === node.loc.end.line
}

function warnIfDoesNotHaveCurlyBraces(statement) {
    if (!statement) return;
    if (hasCurlyBraces(statement)) return;
    return getSnippet(statement,true) + ' needs curly braces';
}
function warnIfNotOnSeparateLines(statement) {
    if (!statement) return;
    if (!isSingleLine(statement)) return;
    return getSnippet(statement,true) + ' should be on separate lines';
}

var lint = {
    IfStatement: function(ifStatement) {
        var warnings = [];
        if (expressionDepthOf(ifStatement.test) > 1) {
            warnings.push(warnIfDoesNotHaveCurlyBraces(ifStatement.consequent));
            warnings.push(warnIfDoesNotHaveCurlyBraces(ifStatement.alternate));

            warnings.push(warnIfNotOnSeparateLines(ifStatement.consequent));
            warnings.push(warnIfNotOnSeparateLines(ifStatement.alternate));
        }
        warnings = _.compact(warnings);

        if (_.isEmpty(warnings)) {
            console.log('\n    Looks good.');
            return;
        }

        console.warn('\n    WARNING [Line ' + ifStatement.loc.start.line + ']: Because ' + wrapString(getSnippet(ifStatement.test), '```') + ' is too complex:');
        console.warn(indent(warnings.join('\n'), '    * '));
    }
};

function indent(str, indentation) {
    return _.map(str.split('\n'), function(line) {
        return indentation + line;
    }).join('\n')
}

function checkLint(code) {
    console.log('Linting\n' + indent('```\n'+code+'\n```', '    '));
    currentCode = code;
    var ast = esprima.parse(code, {
        range: true,
        loc: true,
        comments: true,
        attachComment: true,
        tolerant: false
    });

    estraverse.traverse(ast, {
        enter: function(node) {
            if (node.type === 'IfStatement') lint.IfStatement(node);
        }
    });

    console.log('\n');
}

;(function() {
    var codes = [
        'function x() { if (x && (y || z)) return 10; }',
        'function x() { if (x && (y || z)) { return 10; }}',
        'function x() {\n    if (x && (y || z)) {\n        return 10;\n    }\n}',
        'function x() { if (x) x && 2 }',
        'function x() { if (x) return 10; }'
    ];
    _.each(codes, checkLint);
})();
