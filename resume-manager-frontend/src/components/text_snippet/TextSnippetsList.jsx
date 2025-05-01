import { Droppable } from '@hello-pangea/dnd';
import { useContext } from 'react';

import { DocumentContext } from '../../contexts.jsx';
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
 * @param {Object} props.droppableProps - Properties to use for Droppable.
 * @param {String} props.droppableProps.droppableId - See documentation for
 *  Droppable.
 * @param {String} props.droppableProps.type - See documentation for Droppable.
 */
function TextSnippetsList({
  textSnippets,
  droppableProps: { droppableId, type: droppableType },
}) {
  const [document] = useContext(DocumentContext);

  // --------------------------------------------------

  return (
    <div className="TextSnippetsList section-item-text__p3">
      <Droppable droppableId={droppableId} type={droppableType}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {textSnippets &&
              textSnippets.map((textSnippet, idx) => (
                <TextSnippetCard
                  key={textSnippet.id}
                  textSnippet={textSnippet}
                  idx={idx}
                />
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {document.isMaster ? <AddTextSnippetCard /> : <AttachTextSnippetCard />}
    </div>
  );
}

// ==================================================

export default TextSnippetsList;
