import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
} from 'reactstrap';

import { TextSnippetContext } from '../../contexts.jsx';

import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Component for showing and controlling the form to attach a text snippet to a
 * section item.
 */
function AttachTextSnippetCard() {
  const { attachTextSnippet, getAvailableTextSnippets } =
    useContext(TextSnippetContext);

  const [isRevealed, setIsRevealed] = useState(false);
  const [textSnippetIdAndVersion, setTextSnippetIdAndVersion] = useState([]);
  const [availableTextSnippets, setAvailableTextSnippets] = useState(null);

  const [errorMessages, setErrorMessages] = useState([]);

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

    if (textSnippetIdAndVersion.length) {
      const id = textSnippetIdAndVersion[0];
      const version = textSnippetIdAndVersion[1];

      try {
        const textSnippetToAttach = availableTextSnippets.find(
          (textSnippet) =>
            textSnippet.id == id && textSnippet.version == version
        );

        await attachTextSnippet(id, version, textSnippetToAttach);
      } catch (err) {
        setErrorMessages(err);
        return;
      }

      toggleOpen();
    }
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
