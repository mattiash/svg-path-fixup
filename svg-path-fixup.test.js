describe('SvgPathFixup', function () {
    beforeEach(module('SvgPathFixup'));

    describe('parse', function() {
        it('Contains function "parse"', inject(function (PathList) {
            expect(PathList.parse).not.toBeUndefined();
        }));
        it("Can parse a simple path", inject(function( PathList ) {
            expect(PathList.parse("M 0,0 L 50,50")).toEqual([["M",0,0],["L", 50, 50]]);
        }))
    });

    describe('pretty', function() {
        it("Can prettify a simple expression", inject(function(PathList) {
            expect(PathList.pretty([
                ["M", 0, 0],
                ["L", 50, 50]
            ])).toEqual("M 0 0\nL 50 50");
        }))
    });

    describe('move_x', function () {
        it("Can move a simple expression", inject(function (PathList) {
            expect(
                PathList.move_x([
                    ["M", 0, 0],
                    ["L", 50, 50]
                ], 1)).toEqual([
                    ["M", 1, 0],
                    ["L", 51, 50]
                ]);
        }))
    });

    describe('move_y', function () {
        it("Can move a simple expression", inject(function (PathList) {
            expect(
                PathList.move_y([
                    ["M", 0, 0],
                    ["L", 50, 50]
                ], 1)).toEqual([
                    ["M", 0, 1],
                    ["L", 50, 51]
                ]);
        }))
    });

    describe('to_relative', function () {
        it("Can make a simple expression relative", inject(function (PathList) {
            expect(
                PathList.to_relative([
                    ["M", 0, 0],
                    ["L", 50, 50]
                ]))
                .toEqual([
                    ["M", 0, 0],
                    ["l", 50, 50]
                ]);
        }));

        it("Can make a simple C relative", inject(function(PathList) {
            expect(
                PathList.to_relative([
                    ["M", 0, 0],
                    ["C", 10, 10, 20, 20, 50, 50]
                ]))
                .toEqual([
                    ["M", 0, 0],
                    ["c", 10, 10, 20, 20, 50, 50]
            ]);
        }));
        it("Can make several C relative", inject(function (PathList) {
            expect(
                PathList.to_relative([
                    ["M", 10, 10],
                    ["C", 15, 15, 20, 20, 50, 50],
                    ["C", 15, 15, 20, 20, 50, 50]
                ]))
                .toEqual([
                    ["M", 10, 10],
                    ["c", 5, 5, 10, 10, 40, 40],
                    ["c", -35, -35, -30, -30, 0, 0]
                ]);
        }));
        it("Can handle mixed absolute and relative input", inject(function (PathList) {
            expect(
                PathList.to_relative([
                    ["M", 10, 10],
                    ["c", 5, 5, 10, 10, 40, 40],
                    ["C", 15, 15, 20, 20, 50, 50]
                ]))
                .toEqual([
                    ["M", 10, 10],
                    ["c", 5, 5, 10, 10, 40, 40],
                    ["c", -35, -35, -30, -30, 0, 0]
                ]);
        }));

    });

});