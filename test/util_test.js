import { expect } from 'chai';
import * as util from '../src/util';

describe('util', () => {

  describe('#isPrivateTag', () => {

    it('should return `true` for a private tag', () => {
      const isPrivateTag = util.isPrivateTag('x001d0010');
      expect(isPrivateTag).to.equal(true);
    })

    it('should return `false` for a non-private tag', () => {
      const isPrivateTag = util.isPrivateTag('x00100010');
      expect(isPrivateTag).to.equal(false);
    })

    it('should throw an exception', () => {
      // Arrange
      const tag = 'x100z0010';
      const invoker = () => util.isPrivateTag(tag);

      // Act / Assert
      expect(invoker).to.throw();
    });

  });
});
