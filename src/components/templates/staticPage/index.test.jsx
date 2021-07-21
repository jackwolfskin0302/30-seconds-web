import { cleanup } from '@testing-library/react';
import { renderWithContext } from 'test/utils';
import aboutLiterals from 'lang/en/about';
import StaticPage from './index';

describe('<StaticPage />', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = renderWithContext(<StaticPage stringLiterals={aboutLiterals} />)
      .container;
  });

  afterEach(cleanup);

  describe('should render', () => {
    it('a Shell component', () => {
      expect(wrapper.querySelectorAll('.page-container')).toHaveLength(1);
    });

    it('a PageTitle component', () => {
      expect(wrapper.querySelectorAll('.page-title')).toHaveLength(1);
    });

    it('a subtitle element', () => {
      expect(wrapper.querySelectorAll('.page-title + p')).toHaveLength(1);
    });

    it('4 SimpleCard components', () => {
      expect(wrapper.querySelectorAll('.card')).toHaveLength(4);
    });
  });

  it('should pass the correct data to the Meta component', () => {
    expect(document.title).toContain(aboutLiterals.title);
  });
});
