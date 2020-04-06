import React from 'react';
import { Provider } from 'react-redux';
import Helmet from 'react-helmet';
import createStore from 'state';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Meta from './index';

import literals from 'lang/en/client/common';
import config from 'config/global';
import { decideCookies } from 'state/shell';
import metadata from 'fixtures/metadata';

configure({ adapter: new Adapter() });
console.warn = jest.fn();

const { store } = createStore();

describe('<Meta />', () => {
  // eslint-disable-next-line no-unused-vars
  let wrapper, helmet;

  beforeAll(() => {
    wrapper = mount(
      <Provider store={ store }>
        <Meta />
      </Provider>
    );
    helmet = Helmet.peek();
  });

  it('should use the correct locale', () => {
    expect(helmet.htmlAttributes.lang).toBe('en');
  });

  it('should render the website title when not provided a title', () => {
    expect(helmet.title).toBe(literals.siteName);
  });

  it('should render the website description when not provided a description', () => {
    expect(helmet.metaTags.find(v => v.name === 'description').content).toBe(literals.siteDescription);
  });

  it('should render the correct viewport meta tag', () => {
    expect(helmet.metaTags.find(v => v.name === 'viewport').content).toBe('width=device-width, initial-scale=1');
  });

  it('should render the correct OpenGraph meta tags', () => {
    expect(helmet.metaTags.find(v => v.property === 'og:title').content).toBe(literals.siteName);
    expect(helmet.metaTags.find(v => v.property === 'og:description').content).toBe(literals.siteDescription);
    expect(helmet.metaTags.find(v => v.property === 'og:type').content).toBe('website');
  });

  it('should render the correct Twitter meta tags', () => {
    expect(helmet.metaTags.find(v => v.name === 'twitter:site').content).toBe(config.twitterAccount);
    expect(helmet.metaTags.find(v => v.name === 'twitter:card').content).toBe('summary');
    expect(helmet.metaTags.find(v => v.name === 'twitter:title').content).toBe(literals.siteName);
    expect(helmet.metaTags.find(v => v.name === 'twitter:description').content).toBe(literals.siteDescription);
  });

  it('should render a link tag to Google Analytics', () => {
    expect(helmet.linkTags.find(v => v.href === 'https://www.google-analytics.com')).not.toBe(null);
  });

  describe('with custom attributes', () => {

    beforeAll(() => {
      wrapper = mount(
        <Provider store={ store }>
          <Meta { ...metadata }/>
        </Provider>
      );
      helmet = Helmet.peek();
    });

    it('should render the correct title when provided a title', () => {
      expect(helmet.title).toBe(`${metadata.title} - ${literals.siteName}`);
    });

    it('should render the correct description when provided a description', () => {
      expect(helmet.metaTags.find(v => v.name === 'description').content).toBe(metadata.description);
    });

    it('should render the correct OpenGraph meta tags', () => {
      expect(helmet.metaTags.find(v => v.property === 'og:title').content).toBe(`${metadata.title} - ${literals.siteName}`);
      expect(helmet.metaTags.find(v => v.property === 'og:description').content).toBe(metadata.description);
      expect(helmet.metaTags.find(v => v.property === 'og:image').content).toBe(`${config.websiteUrl}${metadata.logoSrc}`);
    });

    it('should render the correct Twitter meta tags', () => {
      expect(helmet.metaTags.find(v => v.name === 'twitter:title').content).toBe(metadata.title);
      expect(helmet.metaTags.find(v => v.name === 'twitter:description').content).toBe(metadata.description);
      expect(helmet.metaTags.find(v => v.name === 'twitter:image').content).toBe(`${config.websiteUrl}${metadata.logoSrc}`);
    });

    it('should render any additional meta tags passed to the component', () => {
      expect(helmet.metaTags.find(v => v.name === metadata.meta[0].name).content).toBe(metadata.meta[0].content);
    });

    it('should render a link tag to the canonical url', () => {
      expect(helmet.linkTags.find(v => v.rel === 'canonical').href).toBe(`${config.websiteUrl}${metadata.canonical}`);
    });

    it('should render the passed structured data', () => {
      expect(helmet.scriptTags.find(v => v.innerHTML.indexOf('TechArticle') !== -1).type).toBe('application/ld+json');
    });

    it('should render the passed breadcrumbs structured data', () => {
      expect(helmet.scriptTags.find(v => v.innerHTML.indexOf('BreadcrumbList') !== -1).type).toBe('application/ld+json');
    });
  });

  describe('with cookies accepted', () => {
    beforeAll(() => {
      store.dispatch(decideCookies(true));
      wrapper = mount(
        <Provider store={ store }>
          <Meta />
        </Provider>
      );
      helmet = Helmet.peek();
    });

    it('should render the appropriate scripts for analytics', () => {
      expect(helmet.scriptTags.find(v => v.src && v.src.indexOf(config.googleAnalytics.id) !== -1)).not.toBe(null);
      expect(helmet.scriptTags.find(v => v.innerHTML && v.innerHTML.indexOf(config.googleAnalytics.id) !== -1)).not.toBe(null);
      expect(helmet.scriptTags.find(v => v.innerHTML && v.innerHTML.indexOf(`window.gtag('event', 'page_view'`) !== -1)).not.toBe(null);
    });
  });
});
