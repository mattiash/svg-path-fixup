"use strict";

// m X Y at start means something special. Always add M 0 0 at top!
    
angular.module("SvgPathFixup", [])
    .controller("Ctrl", function($scope, PathList) {
        $scope.symbol = {
            path: "",
            pathexpr: "M0,0 L50,50"
        };
        $scope.dx = 1;
        $scope.dy = 1;
        $scope.scaleFactor = 1.02;

        $scope.$watch( 'symbol.pathexpr', function(newVal) {
            if(newVal)
                $scope.symbol.path = PathList.d(PathList.parse(newVal)).replace("\n", " ");
        });

        $scope.pretty = function() {
            $scope.symbol.pathexpr = PathList.pretty(PathList.parse($scope.symbol.pathexpr));
        };

        $scope.x_inc = function() {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.move_x(pl, parseFloat($scope.dx));
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.x_dec = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.move_x(pl, 0-parseFloat($scope.dx));
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.y_inc = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.move_y(pl, parseFloat($scope.dy));
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.y_dec = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.move_y(pl, 0 - parseFloat($scope.dy));
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.to_relative = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.to_relative(pl);
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.to_absolute = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.to_absolute(pl);
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.round = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.round(pl);
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.scale_up = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.scale(pl, parseFloat($scope.scaleFactor));
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

        $scope.scale_down = function () {
            var pl = PathList.parse($scope.symbol.pathexpr);
            var new_pl = PathList.scale(pl, 1/parseFloat($scope.scaleFactor));
            $scope.symbol.pathexpr = PathList.d(new_pl);
        };

    })
    .service("PathList", function() {
        var PathList = {};

        PathList.parse = function(pathexpr) {
            var pl = [];
            pathexpr.split(/(?=[MmZzLlHhVvCcSsQqTtAa])/).map(function (p) {
                p = p.trim();
                if (p.match(/^#/)) {
                    return;
                }
                if (p.match(/^$/)) {
                    return;
                }

                var tokens = p.replace(/^([MmZzLlHhVvCcSsQqTtAa])/, "$1 ").trim().split(/[, ]+/);
                tokens = tokens.map(function (v, i) {
                    if (i === 0) {
                        return v;
                    }
                    else {
                        return parseFloat(v);
                    }
                });
                if (tokens[0].match(/[Cc]/)) {
                    while (tokens.length > 1) {
                        pl.push([tokens[0]].concat(tokens.splice(1, 6)));
                    }
                }
                else if (tokens[0].match(/[LlMm]/)) {
                    while (tokens.length > 1) {
                        pl.push([tokens[0]].concat(tokens.splice(1, 2)));
                    }
                }
                else {
                    pl.push(tokens);
                }
            });
            return pl;
        };

        PathList.d = function (pl) {
            var result = "";
            pl.map(function (p) {
                result += p.join(" ") + " ";
            });
            return result;
        };

        PathList.pretty = function(pl) {
            return PathList.d(pl).replace(/\s*([MmZzLlHhVvCcSsQqTtAa])/g, "\n$1").trim()
        };

        PathList.move_x = function(pl, dx) {
            return pl.map(
                function (p) {
                    return p_move_x(p, dx)
                });
        };

        function p_move_x(p, dx) {
            var op = p[0];

            if (op === "M" || op === "L" || op === "C") {
                p = p.map(function (v, i) {
                    if (i % 2 === 1) {
                        return parseFloat(v) + parseFloat(dx);
                    }
                    return v;
                })
            }
            else if (op.match(/[mlcZz]/)) {
            }
            else {
                console.log("Unknown operator " + p[0]);
            }
            return p;
        }

        PathList.move_y = function (pl, dy) {
            return pl.map(
                function (p) {
                    return p_move_y(p, dy)
                });
        };

        function p_move_y(p, dy) {
            var op = p[0];

            if (op === "M" || op === "L" || op === "C") {
                p = p.map(function (v, i) {
                    if (i % 2 === 0 && i>0) {
                        return parseFloat(v) + parseFloat(dy);
                    }
                    return v;
                })
            }
            else if (op.match(/[mlcZz]/)) {
            }
            else {
                console.log("Unknown operator " + p[0]);
            }
            return p;
        }

        PathList.scale = function (pl, factor) {
            return pl.map(
                function (p) {
                    return p_scale(p, factor)
                });
        };

        function p_scale(p, factor) {
            var op = p[0];
            p = p.map(function (v, i) {
                    if (i > 0) {
                        return v * factor;
                    }
                    return v;
                });
            return p;
        }

        PathList.round = function (pl) {
            return pl.map(
                function (p) {
                    return p_round(p)
                });
        };

        function p_round(p) {
            var op = p[0];
            p = p.map(function (v, i) {
                if (i > 0) {
                    return Math.round(1000*v)/1000;
                }
                return v;
            });
            return p;
        }

        PathList.to_relative = function(pl) {
            var cursor = {};
            var first;
            if( pl[0][0] === "M" ){
                first = pl.splice(0, 1);
            }
            else {
                first = [["M",0,0]];
            }

            cursor.x = first[0][1];
            cursor.y = first[0][2];

            return first.concat(pl.map(
                function (p) {
                    return p_to_relative(cursor, p)
                }));
        };

        function p_to_relative(cursor, p) {
            var op = p[0];

            if (op === "M" || op === "L") {
                p = p.map(function (v, i) {
                    if (i == 0) {
                        return v.toLowerCase();
                    }

                    if (i % 2 === 1) {
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
            else if (op === "C") {
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
            else if (op === "m" || op === "l" ) {
                cursor.x = cursor.x + p[1];
                cursor.y = cursor.y + p[2];
            }
            else if ( op === "c") {
                cursor.x = cursor.x + p[5];
                cursor.y = cursor.y + p[6];
            }
            else if (op.match(/[Zz]/)) {
            }
            else {
                console.log("Unknown operator " + p[0]);
            }
            return p;
        }

        PathList.to_absolute = function(pl) {
            var cursor = {};
            var first;
            if( pl[0][0] === "M" ){
                first = pl.splice(0, 1);
            }
            else {
                first = [["M",0,0]];
            }

            cursor.x = first[0][1];
            cursor.y = first[0][2];

            return first.concat(pl.map(
                function (p) {
                    return p_to_absolute(cursor, p)
                }));
        };

        function p_to_absolute(cursor, p) {
            var op = p[0];

            if (op === "m" || op === "l") {
                p = p.map(function (v, i) {
                    if (i == 0) {
                        return v.toUpperCase();
                    }

                    if (i % 2 === 1) {
                        // X
                        v = v + cursor.x;
                        cursor.x = cursor.x + v;
                    }
                    else {
                        // Y
                        v = v + cursor.y;
                        cursor.y = cursor.y + v;
                    }
                    return v;
                })
            }
            else if (op === "c") {
                p[0] = "C";
                p[1] = p[1] + cursor.x;
                p[2] = p[2] + cursor.y;
                p[3] = p[3] + cursor.x;
                p[4] = p[4] + cursor.y;
                p[5] = p[5] + cursor.x;
                p[6] = p[6] + cursor.y;
                cursor.x = cursor.x - p[5];
                cursor.y = cursor.y - p[6];
            }
            else if (op === "M" || op === "L" ) {
                cursor.x = p[1];
                cursor.y = p[2];
            }
            else if ( op === "C") {
                cursor.x = p[5];
                cursor.y = p[6];
            }
            else if (op.match(/[Zz]/)) {
            }
            else {
                console.log("Unknown operator " + p[0]);
            }
            return p;
        }

        return PathList;
    });
