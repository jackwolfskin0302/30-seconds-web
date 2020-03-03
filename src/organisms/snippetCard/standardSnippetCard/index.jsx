import React from 'react';
import PropTypes from 'prop-types';
import Anchor from 'atoms/anchor';
import Card from 'atoms/card';
import TagList from 'atoms/tagList';
import Expertise from 'atoms/expertise';
import CodeBlock from 'atoms/codeBlock';
import { CopyButton, CodepenButton } from 'atoms/button';
import { Snippet as SnippetPropType } from 'typedefs';
import { trimWhiteSpace } from 'functions/utils';
import { JSX_SNIPPET_PRESETS } from 'shared';
import _ from 'lang';
const _l = _('en');

const SnippetCard = ({
  snippet,
  className,
  hasGithubLinksEnabled = false,
  ...rest
}) => (
  <Card className={ trimWhiteSpace`snippet-card ${className}` } { ...rest } >
    <div className='card-meta'>
      <div className={ `card-icon icon icon-${snippet.icon}` }>
        <Expertise level={ snippet.expertise ? snippet.expertise : snippet.languageShort === 'blog' ? 'blog' : null } />
      </div>
      <div className='card-data'>
        <h4 className='card-title'>{ snippet.title }</h4>
        <TagList
          tags={
            [
              snippet.language.long, ...snippet.tags.all,
            ]
          }
        />
      </div>
    </div>
    { hasGithubLinksEnabled && (
      <Anchor
        className='github-link'
        link={ {
          url: snippet.url,
          internal: false,
          target: '_blank',
          rel: 'nofollow noopener noreferrer',
        } }
      >
        { _l('View on GitHub') }
      </Anchor>
    ) }
    <div
      className='card-description'
      dangerouslySetInnerHTML={ { __html: `${snippet.html.fullDescription}` } }
    />
    <div className='card-source-content'>
      {
        snippet.language.otherLanguages
          ? (
            <CodepenButton
              jsCode={ `${snippet.code.src}\n\n${snippet.code.example}` }
              htmlCode={ JSX_SNIPPET_PRESETS.envHtml }
              cssCode={ snippet.code.style }
              jsPreProcessor={ JSX_SNIPPET_PRESETS.jsPreProcessor }
              jsExternal={ JSX_SNIPPET_PRESETS.jsImports }
            />
          )
          : (
            <CopyButton
              text={ snippet.code.src }
            />
          )
      }
      {
        snippet.code.style ? (
          <CodeBlock
            language={ snippet.language.otherLanguages[0] }
            htmlContent={ snippet.html.style }
            className='card-code'
          />
        ) : null
      }
      <CodeBlock
        language={ snippet.language }
        htmlContent={ snippet.html.code }
        className='card-code'
      />
      <h5 className='card-example-title'>{ _l('Examples') }</h5>
      <CodeBlock
        language={ snippet.language }
        htmlContent={ snippet.html.example }
        className='card-example'
      />
    </div>
  </Card>
);

SnippetCard.propTypes = {
  /** Snippet data for the card */
  snippet: SnippetPropType,
  /** Additional classes for the card */
  className: PropTypes.string,
  /** Are GitHub links enabled? */
  hasGithubLinksEnabled: PropTypes.bool,
  /** Any other arguments to be passed to the card */
  rest: PropTypes.any,
};

export default SnippetCard;
