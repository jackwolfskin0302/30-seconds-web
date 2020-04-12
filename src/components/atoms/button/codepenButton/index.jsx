import React from 'react';
import PropTypes from 'typedefs/proptypes';
import { combineClassNames } from 'utils';
import literals from 'lang/en/client/common';

/* eslint-disable camelcase */

const propTypes = {
  /** JS code to be passed to the CodePen definition */
  jsCode: PropTypes.string,
  /** HTML code to be passed to the CodePen definition */
  htmlCode: PropTypes.string,
  /** CSS code to be passed to the CodePen definition */
  cssCode: PropTypes.string,
  /** JS preprocessor ("none" || "coffeescript" || "babel" || "livescript" || "typescript") */
  jsPreProcessor: PropTypes.string,
  /** External JS files to be included */
  jsExternal: PropTypes.arrayOf(PropTypes.string),
};

/**
 * Button that links to a generated Codepen from the page data.
 * Uses the CodePen API: https://blog.codepen.io/documentation/api/prefill/
 * @param {string} jsCode - JavaScript code to be sent to the CodePen API
 * @param {string} htmlCode - HTML code to be sent to the CodePen API
 * @param {string} cssCode - CSS code to be sent to the CodePen API
 * @param {string} jsPreProcessor - JS preprocessor, sent to the CodePen API.
 *   One of the following: "none", "coffeescript", "babel", "livescript", "typescript"
 * @param {string} jsExternal - External JS files to be included, sent to the CodePen API
 */
const CodepenButton = ({
  jsCode,
  htmlCode,
  cssCode,
  jsPreProcessor = 'none',
  jsExternal = [],
}) => {
  const [active, setActive] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const btnRef = React.useRef();
  return (
    <form action='https://codepen.io/pen/define' method='POST' target='_blank'>
      <input
        type='hidden'
        name='data'
        value={
          JSON.stringify({
            js: jsCode,
            css: cssCode,
            html: htmlCode,
            js_pre_processor: jsPreProcessor,
            js_external: jsExternal.join(';'),
          })
        }
      />
      <button
        className={ combineClassNames`btn codepen-btn icon ${active ? 'icon-check active' : 'icon-codepen'}` }
        ref={ btnRef }
        title={ literals.codepen }
        onClick={ e => {
          if(!processing) {
            e.preventDefault();
            setTimeout(() => setActive(true), 100);
            setTimeout(() => {
              setActive(false);
              btnRef.current.click();
            }, 750);
          }
          setProcessing(!processing);
        } }
      />
    </form>
  );
};

CodepenButton.propTypes = propTypes;

export default CodepenButton;
