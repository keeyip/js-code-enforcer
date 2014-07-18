js-code-enforcer
================

Experiments in checking against javascript coding styles, using esprima; possibly integrate with eslint

Install
=======
    git checkout
    npm install .

Run
======
    node main.js

Example output
=======
    
    Linting
        ```
        function x() { if (x && (y || z)) return 10; }
        ```
    
        WARNING [Line 1]: Because ```x && (y || z)``` is too complex:
        * ```return 10;``` needs curly braces
        * ```return 10;``` should be on separate lines
    
    
    Linting
        ```
        function x() { if (x && (y || z)) { return 10; }}
        ```
    
        WARNING [Line 1]: Because ```x && (y || z)``` is too complex:
        * ```{ return 10; }``` should be on separate lines
    
    
    Linting
        ```
        function x() {
            if (x && (y || z)) {
                return 10;
            }
        }
        ```
    
        Looks good.
    
    
    Linting
        ```
        function x() { if (x) x && 2 }
        ```
    
        Looks good.
    
    
    Linting
        ```
        function x() { if (x) return 10; }
        ```
    
        Looks good.
