describe('SvgPathFixup', function () {
    beforeEach(module('SvgPathFixup'));
    it('Contains function "parse"', inject(function (PathList) {
        expect(PathList.parse).not.toBeUndefined();
    }));
});