import { Button } from 'reactstrap';

import useConfirmClick from '../util/useConfirmClick.jsx';

import TrashSvg from '../assets/trashSvg.jsx';

// ==================================================

/**
 * Renders a trash button that can be clicked.  Asks for confirmation before
 * deleting.
 *
 * @param {Object} props - React component properties.
 * @param {Function} clickFunc - The function to run after clicking twice.
 */
function TrashButton({ clickFunc }) {
  const [clickedOnce, handleClick] = useConfirmClick(clickFunc);

  // --------------------------------------------------

  return (
    <Button
      color="primary"
      style={clickedOnce ? { padding: '0.375rem 0.55rem' } : {}}
      onClick={handleClick}
    >
      {clickedOnce ? (
        <>
          <TrashSvg fill="red" />
          <span style={{ color: 'red' }}>?</span>
        </>
      ) : (
        <TrashSvg fill="black" />
      )}
    </Button>
  );
}

// ==================================================

export default TrashButton;
