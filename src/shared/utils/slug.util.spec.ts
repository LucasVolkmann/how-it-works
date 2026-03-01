import { describe, expect, it } from 'vitest';
import { slugify } from './slug.utils.js';

describe('slug unit', () => {
  it('shoulg return corret slugfy title', () => {
    const mockedTitle = 'How To Create A Rest API Using NodeJS';
    const expectedResult = 'how-to-create-a-rest-api-using-nodejs';

    expect(slugify(mockedTitle)).toBe(expectedResult);
  });
});
