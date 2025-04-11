import { useContext } from 'react';

import { DocumentContext } from '../contexts.jsx';
import AddTextSnippetCard from './AddTextSnippetCard.jsx';
import AttachTextSnippetCard from './AttachTextSnippetCard.jsx';
import TextSnippetCard from './TextSnippetCard.jsx';

// ==================================================

/**
 * Renders a list of text snippets for a section item, such as an experience.
 *
 * @param {Object} props - React component properties.
 * @param {Object[]} props.textSnippets - A list of text snippet Objects to use
 *  for rendering.
 * @param {Function} props.addTextSnippet - Takes the data for a new text
 *  snippet. Then creates and adds a text snippet to an education, skill,
 *  project, etc..
 */
function TextSnippetsList({
  textSnippets,
  addTextSnippet,
  getAvailableTextSnippets,
}) {
  const [document] = useContext(DocumentContext);

  // --------------------------------------------------

  return (
    <div className="SectionItemsList">
      {textSnippets &&
        textSnippets.map((textSnippet) => (
          <TextSnippetCard key={textSnippet.id} textSnippet={textSnippet} />
        ))}
      {document.isMaster ? (
        <AddTextSnippetCard addTextSnippet={addTextSnippet} />
      ) : (
        <AttachTextSnippetCard
          getAvailableTextSnippets={getAvailableTextSnippets}
        />
      )}
    </div>
  );
}

// ==================================================

export default TextSnippetsList;
