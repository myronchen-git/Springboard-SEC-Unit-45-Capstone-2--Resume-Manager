import TextSnippetCard from './TextSnippetCard.jsx';

// ==================================================

function TextSnippetsList({ textSnippets }) {
  return (
    <div className="SectionItemsList">
      {textSnippets.map((textSnippet) => (
        <TextSnippetCard key={textSnippet.id} textSnippet={textSnippet} />
      ))}
    </div>
  );
}

// ==================================================

export default TextSnippetsList;
