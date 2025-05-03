import { useContext, useState } from 'react';
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

import TrashIcon from '../TrashIcon.jsx';

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

  async function toggleOpen() {
    setIsRevealed(!isRevealed);
    setTextSnippetIdAndVersion([]);
    setErrorMessages([]);

    if (!isRevealed && availableTextSnippets === null)
      setAvailableTextSnippets(await getAvailableTextSnippets());
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setTextSnippetIdAndVersion(value.split('|'));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (textSnippetIdAndVersion.length) {
      const id = Number(textSnippetIdAndVersion[0]);
      const version = textSnippetIdAndVersion[1];

      try {
        const textSnippetToAttach = availableTextSnippets.find(
          (textSnippet) =>
            textSnippet.id === id && textSnippet.version === version
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
    <Card tag="article">
      {isRevealed ? (
        <>
          <CardHeader tag="article">
            <span></span>
            <span></span>
            <span>
              <TrashIcon clickFunc={toggleOpen} />
            </span>
          </CardHeader>
          <CardBody tag="section">
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
                {availableTextSnippets &&
                  availableTextSnippets.map((textSnippet) => {
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
              <Button color="primary" type="submit">
                Add
              </Button>
            </Form>
          </CardBody>
        </>
      ) : (
        <CardBody tag="section" onClick={toggleOpen}>
          Attach Text
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AttachTextSnippetCard;
