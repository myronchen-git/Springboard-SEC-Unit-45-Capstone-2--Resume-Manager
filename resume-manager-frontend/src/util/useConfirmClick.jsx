import { useRef, useState } from 'react';

// ==================================================

/**
 * Handles the logic of clicking once, waiting for a second click for a certain
 * amount of time, and then running a function after the second click.  If the
 * second click is not clicked in time, the logic resets.
 *
 * @param {Function} clickFunc - Original intended action to run after clicking.
 * @returns {Array} First item is the state of whether there was a click.
 *  Second item is the asynchronous function to process the click.
 */
function useConfirmClick(clickFunc) {
  const [clickedOnce, setClickedOnce] = useState(false);
  const timeoutId = useRef(null);
  const delayTime = 3000;

  async function handleClick() {
    if (clickedOnce) {
      timeoutId.current = null;

      await clickFunc();
    } else {
      setClickedOnce(true);

      timeoutId.current = setTimeout(() => {
        setClickedOnce(false);
      }, delayTime);
    }
  }

  return [clickedOnce, handleClick];
}

// ==================================================

export default useConfirmClick;
