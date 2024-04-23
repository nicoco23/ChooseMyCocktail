import React from 'react';

function Checklist({ items, selectedItems, onToggle }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={item}
            value={item}
            checked={selectedItems.includes(item)}
            onChange={() => onToggle(item)}
          />
          <label htmlFor={item}>{item}</label>
        </div>
      ))}
    </div>
  );
}

export default Checklist;
