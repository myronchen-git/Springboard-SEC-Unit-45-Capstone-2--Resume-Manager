import { useContext, useState } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

import { TextSnippetContext } from '../../contexts.jsx';
import GenericForm from '../GenericForm.jsx';

import {
  TEXT_SNIPPET_FIELDS,
  TEXT_SNIPPET_OPTIONAL_FIELDS_START_INDEX,
} from '../../commonData.js';

import TrashIcon from '../TrashIcon.jsx';

// ==================================================

/**
 * Component for showing and controlling the form to add a new text snippet
 * entry.
 */
function AddTextSnippetCard() {
  const { addTextSnippet } = useContext(TextSnippetContext);
  const [isAddTextSnippetFormOpen, setIsAddTextSnippetFormOpen] =
    useState(false);

  // --------------------------------------------------

  async function handleSubmit(formData) {
    // Removing fields with empty Strings, so that the back-end does not assume
    // a user is trying to update particular fields.
    const formDataCopy = { ...formData };
    for (const prop in formDataCopy) {
      if (!formDataCopy[prop]) delete formDataCopy[prop];
    }

    await addTextSnippet(formDataCopy);

    setIsAddTextSnippetFormOpen(false);
  }

  // --------------------------------------------------

  const initialFormData = TEXT_SNIPPET_FIELDS.reduce((obj, field) => {
    obj[field.jsName] = '';
    return obj;
  }, {});
  // Temporary setting of type to pass back-end rules.  The type property of
  // text snippets might be removed in the future.
  initialFormData.type = 'plain';

  return (
    <Card className="AddTextSnippetCard" tag="article">
      {isAddTextSnippetFormOpen ? (
        <>
          <CardHeader tag="header">
            <span></span>
            <span></span>
            <span>
              <TrashIcon clickFunc={() => setIsAddTextSnippetFormOpen(false)} />
            </span>
          </CardHeader>
          <CardBody tag="section">
            <GenericForm
              fields={TEXT_SNIPPET_FIELDS}
              optionalFieldsStartIndex={
                TEXT_SNIPPET_OPTIONAL_FIELDS_START_INDEX
              }
              initialFormData={initialFormData}
              processSubmission={handleSubmit}
            />
          </CardBody>
        </>
      ) : (
        <CardBody
          tag="section"
          onClick={() => setIsAddTextSnippetFormOpen(true)}
        >
          Add Text
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AddTextSnippetCard;
