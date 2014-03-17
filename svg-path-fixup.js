"use strict";

// m X Y at start means something special. Always add M 0 0 at top!
    
angular.module("SvgPathFixup", [])
    .controller("Ctrl", function($scope, PathList) {
        $scope.symbol = {
            path: "",
            pathexpr: "M0,0 L50,50"
        };
        $scope.dx = 1;

        $scope.$watch( 'symbol.pathexpr', function(newVal) {
            $scope.symbol.path = pl_to_string(PathList.parse(newVal)).replace("\n", " ");
        });

        $scope.pretty = function() {
            $scope.symbol.pathexpr = PathList.d(PathList.parse($scope.symbol.pathexpr))
                .replace(/([MmZzLlHhVvCcSsQqTtAa])/g, "\n$1");
        };

        $scope.x_inc = function() {
            var pl = parse_pathexpr($scope.symbol.pathexpr);
            var new_pl = move_x(pl, $scope.dx);
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.x_dec = function () {
            var pl = parse_pathexpr($scope.symbol.pathexpr);
            var new_pl = move_x(pl, 0-parseFloat($scope.dx));
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.to_relative = function () {
            var pl = parse_pathexpr($scope.symbol.pathexpr);
            var new_pl = to_relative(pl);
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

    })
    .service("PathList", function() {
        return {
            parse: parse_pathexpr,
            d: pl_to_string
        }
    });

function parse_pathexpr(pathexpr) {
    var pl = [];
    pathexpr.split("\n").map(function(p) {
        p = p.trim();
        if(p.match(/^#/)) {
            return;
        }
        if(p.match(/^$/)) {
            return;
        }

        var tokens = p.trim().replace(/^([MmZzLlHhVvCcSsQqTtAa])/, "$1 ").split(/[, ]+/);
        console.log(tokens[0]);
        if(tokens[0].match(/[Cc]/)){
            while(tokens.length > 1) {
                pl.push( [tokens[0]].concat(tokens.splice(1,6)));
            }
        }
        else {
            pl.push(tokens);
        }
    } );
    return pl;
}

function move_x(pl, dx) {
    return pl.map(
        function (p) {
            return p_move_x(p, dx)
        });
}

function p_move_x(p, dx) {
    var op = p[0];

    if(op === "M" || op === "L" || op === "C" ) {
        p = p.map(function(v,i) {
           if(i % 2 === 1) {
               return parseFloat(v)+parseFloat(dx);
           }
           return v;
        })
    }
    else if( op === "m" || op === "l" || op === "c") {}
    else {
        console.log( "Unknown operator " + p[0]);
    }
    return p;
}

function to_relative(pl) {
    var cursor = {x: 0, y: 0};
    return pl.map(
        function (p) {
            return p_to_relative(cursor, p)
        });
}

function p_to_relative(cursor, p) {
    var op = p[0];

    if (op === "M" || op === "L" ) {
        p = p.map(function (v, i) {
            if (i == 0) {
                return v.toLowerCase();
            }
            else {
                v = parseFloat(v);
            }
            if( i % 2 === 1 ) {
                // X
                v = v - cursor.x;
                cursor.x = cursor.x + v;
            }
            else {
                // Y
                v = v - cursor.y;
                cursor.y = cursor.y + v;
            }
            return v;
        })
    }
    else if( op === "C" ) {
        p[0] = "c";
        p[1] = p[1] - cursor.x;
        p[2] = p[2] - cursor.y;
        p[3] = p[3] - cursor.x;
        p[4] = p[4] - cursor.y;
        p[5] = p[5] - cursor.x;
        p[6] = p[6] - cursor.y;
        cursor.x = cursor.x + p[5];
        cursor.y = cursor.y + p[6];
    }
    else if (op === "m" || op === "l" || op === "c") {
    }
    else {
        console.log("Unknown operator " + p[0]);
    }
    return p;
}

function pl_to_string(pl) {
    var result = "";
    pl.map(function (p) {
        result += p.join(" ") + "\n";
    });
    return result;
}