import PropTypes from 'typedefs/proptypes';
import Link from 'next/link';
import literals from 'lang/en/client/paginator';

const propTypes = {
  paginator: PropTypes.paginator,
};

/**
 * Renders a pagination component.
 * @param {object} paginator - Pagination data fo the component.
 */
const Paginator = ({ paginator: { pageNumber, totalPages, baseUrl } }) => {
  if (totalPages <= 1) return null;

  /*
    Up to 3 buttons (apart from next and previous):
    - page 1: 1·2·{totalPages}
    - page X: 1·X·{totalPages}
    - page {totalPages}: 1·{totalPages-1}·{totalPages}
    - totalPages <= 3: all
  */
  let buttons =
    totalPages === 2
      ? [1, 2]
      : [1, Math.min(Math.max(pageNumber, 2), totalPages - 1), totalPages];

  return (
    <div className='paginator mt-7 mx-5 mb-6 a-center flex j-center'>
      {pageNumber > 1 && (
        <Link href={`${baseUrl}/p/${pageNumber - 1}?from=paginator`}>
          <a
            className='btn action-btn previous-page j-center fs-no md:fs-sm icon icon-chevron-left box-border before:fs-md'
            rel='prev'
          >
            {literals.previous}
          </a>
        </Link>
      )}
      {buttons.map(buttonNumber =>
        buttonNumber === pageNumber ? (
          <span className='fs-xl box-border' key={buttonNumber}>
            {buttonNumber}
          </span>
        ) : (
          <Link
            key={buttonNumber}
            href={`${baseUrl}/p/${buttonNumber}?from=paginator`}
          >
            <a className='btn action-btn fs-md box-border'>{buttonNumber}</a>
          </Link>
        )
      )}
      {pageNumber < totalPages && (
        <Link href={`${baseUrl}/p/${pageNumber + 1}?from=paginator`}>
          <a
            className='btn action-btn next-page j-center fs-no md:fs-sm icon icon-chevron-right box-border before:fs-md'
            rel='next'
          >
            {literals.next}
          </a>
        </Link>
      )}
    </div>
  );
};

Paginator.propTypes = propTypes;

export default Paginator;
