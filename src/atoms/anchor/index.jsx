import React from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import { Link as LinkPropType } from 'typedefs';
import { addTrailingSlashToSlug } from 'functions/utils';

/**
 * Anchor component for linking to a different URL (internal or external).
 * Depends on Gatsby's Link component for internal linking.
 */
const Anchor = ({
  children,
  link,
  ...rest
}) => {
  return link.internal ?
    (
      <Link
        to={ addTrailingSlashToSlug(link.url) }
        rel={ link.rel }
        target={ link.target }
        { ...rest }
      >
        { children }
      </Link>
    ) : (
      <a
        href={ link.url }
        rel={ link.rel }
        target={ link.target }
        { ...rest }
      >
        { children }
      </a>
    );
};

Anchor.propTypes = {
  /** Children elements */
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  /** Anchor link data */
  link: LinkPropType.isRequired,
  /** Any other props to be passed to the component */
  rest: PropTypes.any,
};

export default Anchor;
