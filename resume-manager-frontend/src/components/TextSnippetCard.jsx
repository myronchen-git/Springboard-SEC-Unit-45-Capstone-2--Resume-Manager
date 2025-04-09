import { useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import trashIcon from '../assets/trash.svg';

// ==================================================

/**
 * Renders a view for displaying and editing a text snippet.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.textSnippet - The text snippet object, that contains
 *  properties like content, to display.
 * @param {Boolean} props.addBullet - Whether to add a bullet point to the
 *  beginning of the text content.
 */
function TextSnippetCard({ textSnippet, addBullet = true }) {
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  return (
    <Card className="TextSnippetCard" data-id={textSnippet.id}>
      <CardHeader className="text-end">
        {errorMessages.map((msg) => (
          <Alert key={msg} color="danger">
            {msg}
          </Alert>
        ))}
        <img src={trashIcon} alt="trash icon" />
      </CardHeader>
      <CardBody className="text-start">
        {addBullet && <>&bull; </>}
        {textSnippet.content}
      </CardBody>
    </Card>
  );
}

// ==================================================

export default TextSnippetCard;
