import { useContext, useState } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import GenericForm from '../GenericForm.jsx';

import {
  CONTACT_INFO_FIELDS,
  CONTACT_INFO_FIELDS_START_INDEX,
} from '../../commonData.js';

import pencilIcon from '../../assets/pencil.svg';

import './ContactInfoCard.css';

// ==================================================

/**
 * Renders a view for displaying and editing contact info.
 */
function ContactInfoCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [document, setDocument] = useContext(DocumentContext);

  // --------------------------------------------------

  /**
   * Sends an API request to update contact info.  Then updates the document
   * state with the returned updated info.
   *
   * @param {Object} formData - Holds updated contact info data.
   */
  async function editContactInfo(formData) {
    const updatedContactInfo = await ResumeManagerApi.updateContactInfo(
      formData
    );

    // Removing extra username property, because document Object/state doesn't
    // have it.
    delete updatedContactInfo.username;

    // Clone document so that React sees the document state has been modified,
    // and then update it with new contact information.
    setDocument({ ...document, contactInfo: updatedContactInfo });

    setIsEditing(false);
  }

  // --------------------------------------------------

  // Convert current null fields in contact info to empty Strings, so that they
  // are properly displayed in form inputs.
  const initialFormData = CONTACT_INFO_FIELDS.reduce((obj, field) => {
    obj[field.jsName] = document.contactInfo?.[field.jsName] || '';
    return obj;
  }, {});

  return (
    <Card className="ContactInfoCard" tag="article">
      <CardHeader tag="header">
        <span></span>
        <span></span>
        <span>
          <div
            className="clickable-icon"
            onClick={() => setIsEditing((previousState) => !previousState)}
          >
            <img src={pencilIcon} alt="edit icon" />
          </div>
        </span>
      </CardHeader>
      {isEditing ? (
        <CardBody tag="section">
          <GenericForm
            fields={CONTACT_INFO_FIELDS}
            optionalFieldsStartIndex={CONTACT_INFO_FIELDS_START_INDEX}
            initialFormData={initialFormData}
            processSubmission={editContactInfo}
          />
        </CardBody>
      ) : (
        <CardBody tag="section">
          <h2 className="ContactInfoCard__name">
            {document?.contactInfo?.fullName || 'Input Contact Info'}
          </h2>
          {document?.contactInfo && (
            <div className="ContactInfoCard__contact-info">
              {Object.entries(document.contactInfo).reduce(
                (infoList, [infoName, infoValue]) => {
                  if (infoName !== 'fullName' && infoValue) {
                    infoList.push(
                      <span
                        key={infoName}
                        className="ContactInfoCard__contact-info-piece"
                      >
                        {infoValue}
                      </span>
                    );
                  }

                  return infoList;
                },
                []
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
