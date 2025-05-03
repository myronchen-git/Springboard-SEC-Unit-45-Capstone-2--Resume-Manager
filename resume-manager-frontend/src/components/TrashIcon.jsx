import useConfirmClick from '../util/useConfirmClick.jsx';

import TrashSvg from '../assets/trashSvg.jsx';

// ==================================================

/**
 * Renders a trash icon that can be clicked.  Asks for confirmation before
 * deleting.
 *
 * @param {Object} props - React component properties.
 * @param {Function} clickFunc - The function to run after clicking twice.
 */
function TrashIcon({ clickFunc }) {
  const [clickedOnce, handleClick] = useConfirmClick(clickFunc);

  // --------------------------------------------------

  return (
    <div
      className={
        'clickable-icon' + (clickedOnce ? ' clickable-icon--warn' : '')
      }
      onClick={handleClick}
    >
      {clickedOnce ? (
        <>
          <TrashSvg fill="red" />
          <span>?</span>
        </>
      ) : (
        <TrashSvg fill="black" />
      )}
    </div>
  );
}

// ==================================================

export default TrashIcon;
