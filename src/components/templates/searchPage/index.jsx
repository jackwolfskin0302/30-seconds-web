import React from 'react';
import PropTypes from 'typedefs/proptypes';
import { connect } from 'react-redux';
import Meta from 'components/organisms/meta';
import Shell from 'components/organisms/shell';
import SearchResults from 'components/organisms/searchResults';
import { pushNewPage } from 'state/navigation';
import { initializeIndex } from 'state/search';
import literals from 'lang/en/client/search';

const propTypes = {
  pageContext: PropTypes.shape({
    logoSrc: PropTypes.string.isRequired,
    splashLogoSrc: PropTypes.string.isRequired,
    pageDescription: PropTypes.string.isRequired,
    recommendedSnippets: PropTypes.arrayOf(PropTypes.shape({})),
    searchIndex: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  searchQuery: PropTypes.string,
  dispatch: PropTypes.func,
};

/**
 * Renders the search page.
 * Used to render the /search page.
 */
const SearchPage = ({
  pageContext: {
    logoSrc,
    splashLogoSrc,
    recommendedSnippets,
    pageDescription,
    searchIndex,
  },
  searchQuery,
  dispatch,
}) => {
  React.useEffect(() => {
    dispatch(pushNewPage(literals.search, '/search'));
    dispatch(initializeIndex(searchIndex));
  }, []);

  return (
    <>
      <Meta
        logoSrc={ splashLogoSrc }
        description={ pageDescription }
        title={ searchQuery.length === 0 ? literals.search : literals.resultsFor(searchQuery) }
      />
      <Shell logoSrc={ logoSrc } isSearch >
        <SearchResults recommendedSnippets={ recommendedSnippets }/>
      </Shell>
    </>
  );
};

SearchPage.propTypes = propTypes;

export default connect(
  state => ({
    searchQuery: state.search.searchQuery,
  }),
  null
)(SearchPage);
