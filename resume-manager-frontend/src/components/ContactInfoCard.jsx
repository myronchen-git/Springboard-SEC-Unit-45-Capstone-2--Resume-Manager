import { useContext, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';

import editIcon from '../assets/pencil.svg';

// ==================================================

const contactInfoProperties = [
  { jsName: 'fullName', displayName: 'Full Name' },
  { jsName: 'location', displayName: 'Location' },
  { jsName: 'email', displayName: 'Email' },
  { jsName: 'phone', displayName: 'Phone' },
  { jsName: 'linkedin', displayName: 'LinkedIn' },
  { jsName: 'github', displayName: 'GitHub' },
];

// --------------------------------------------------

function ContactInfoCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [document, setDocument] = useContext(DocumentContext);

  const contactInfoData =
    document.contactInfo ||
    contactInfoProperties.reduce((obj, { jsName }) => {
      obj[jsName] = '';
      return obj;
    }, {});

  const [formData, setFormData] = useState(contactInfoData);

  // --------------------------------------------------

  function toggleEdit() {
    setIsEditing(!isEditing);
    setFormData(contactInfoData);
    setErrorMessages([]);
  }

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    let updatedContactInfo;
    try {
      updatedContactInfo = await ResumeManagerApi.updateContactInfo(formData);

      // Removing extra username property, because document Object/state doesn't
      // have it.
      delete updatedContactInfo.username;
    } catch (err) {
      setErrorMessages(err);
      return;
    }

    // Clone document so that React sees the document state has been modified,
    // and then update it with new contact information.
    const documentClone = structuredClone(document);
    documentClone.contactInfo = updatedContactInfo;
    setDocument(documentClone);

    toggleEdit();
  }

  // --------------------------------------------------

  return (
    <Card className="ContactInfoCard" tag="article">
      <CardHeader className="text-end" onClick={toggleEdit}>
        <img src={editIcon} alt="edit icon" />
      </CardHeader>
      {isEditing ? (
        <CardBody>
          <Form onSubmit={handleSubmit}>
            {contactInfoProperties.map(({ jsName, displayName }) => (
              <FormGroup key={jsName} className="text-start">
                <Label
                  htmlFor={`ContactInfoCard__input-${jsName.toLowerCase()}`}
                >
                  <b>{displayName}</b>
                </Label>
                <Input
                  id={`ContactInfoCard__input-${jsName.toLowerCase()}`}
                  type="text"
                  name={jsName}
                  value={formData?.[jsName] || ''}
                  onChange={handleChange}
                />
              </FormGroup>
            ))}
            {errorMessages.map((msg) => (
              <Alert key={msg} color="danger">
                {msg}
              </Alert>
            ))}
            <Button color="light" type="submit">
              Submit
            </Button>
          </Form>
        </CardBody>
      ) : (
        <CardBody>
          <h2 className="ContactInfoCard__name">
            {document?.contactInfo?.fullName || 'Input Contact Info'}
          </h2>
          {document?.contactInfo && (
            <div className="ContactInfoCard__contact-info">
              {Object.entries(document.contactInfo).map(
                ([infoName, infoValue]) => {
                  if (infoName !== 'fullName') {
                    return (
                      <div
                        key={infoName}
                        className="ContactInfoCard__contact-info-piece"
                      >
                        {infoValue}
                      </div>
                    );
                  }
                }
              )}
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default ContactInfoCard;
