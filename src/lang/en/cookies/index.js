import fs from 'fs-extra';
import path from 'path';
import config from 'config/global';

const literals = {
  title: 'Cookie policy',
  subtitle: 'Understand how we use cookies.',
  pageDescription: `Read about the cookie policy of ${config.websiteName}.`,
  cards: [
    {
      title: 'What are cookies',
      html: 'whatAreCookies.html',
    },
    {
      title: 'How we use cookies',
      html: 'howWeUseCookies.html',
    },
    {
      title: 'Disabling cookies',
      html: 'disablingCookies.html',
    },
    {
      title: 'The cookies we set',
      html: 'theCookiesWeSet.html',
    },
    {
      title: 'More information',
      html: 'moreInformation.html',
    },
  ],
};

literals.cards.forEach(({ html }, i) => {
  literals.cards[i].html = fs.readFileSync(path.resolve(__dirname, html), 'utf8');
});

export default literals;
