import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
} from 'reactstrap';

import trashIcon from '../assets/trash.svg';

// ==================================================

function AttachTextSnippetCard({ getAvailableTextSnippets }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [textSnippetIdAndVersion, setTextSnippetIdAndVersion] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [availableTextSnippets, setAvailableTextSnippets] = useState(null);

  // --------------------------------------------------

  useEffect(() => {
    async function runEffect() {
      setAvailableTextSnippets(await getAvailableTextSnippets());
    }

    runEffect();
  }, [getAvailableTextSnippets]);

  // --------------------------------------------------

  function toggleOpen() {
    setIsRevealed(!isRevealed);
    setTextSnippetIdAndVersion([]);
    setErrorMessages([]);
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setTextSnippetIdAndVersion(value.split('|'));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    // Call API
  }

  // --------------------------------------------------

  return (
    <Card>
      {isRevealed ? (
        <>
          <CardHeader className="text-end">
            <img src={trashIcon} alt="trash icon" onClick={toggleOpen} />
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit}>
              <Input
                type="select"
                name="textSnippetIdAndVersion"
                defaultValue=""
                onChange={handleChange}
              >
                <option value="" disabled>
                  Choose a text
                </option>
                {availableTextSnippets.map((textSnippet) => {
                  return (
                    <option
                      key={textSnippet.id}
                      value={textSnippet.id + '|' + textSnippet.version}
                    >
                      {textSnippet.content}
                    </option>
                  );
                })}
              </Input>
              {errorMessages.map((msg) => (
                <Alert key={msg} color="danger">
                  {msg}
                </Alert>
              ))}
              <Button color="light" type="submit">
                Add
              </Button>
            </Form>
          </CardBody>
        </>
      ) : (
        <CardBody onClick={toggleOpen}>
          Attach Text
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AttachTextSnippetCard;
