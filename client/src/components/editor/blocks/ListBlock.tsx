import { useRef } from 'react';
import type { Block } from '../types.js';

interface ListBlockProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onExitList: () => void;
  onRemove: () => void;
  onFocus: () => void;
}

export function ListBlock({
  block,
  isFocused: _isFocused,
  onUpdate,
  onExitList,
  onRemove,
  onFocus,
}: ListBlockProps) {
  const isNumbered = block.listType === 'numbered';
  const items = block.items && block.items.length > 0 ? block.items : [''];
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleItemChange = (index: number, newContent: string) => {
    const updated = [...items];
    updated[index] = newContent;
    onUpdate({ items: updated });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    const currentText = items[index] || '';

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // If current item is empty and is the last item, exit list
      if (!currentText.trim() && index === items.length - 1) {
        if (items.length === 1) {
          onRemove();
        } else {
          // Remove last empty item and exit list
          const updated = items.slice(0, -1);
          onUpdate({ items: updated });
        }
        onExitList();
        return;
      }

      // Otherwise insert new item after current
      const updated = [...items];
      updated.splice(index + 1, 0, '');
      onUpdate({ items: updated });
      setTimeout(() => {
        itemRefs.current[index + 1]?.focus();
      }, 0);
      return;
    }

    if (e.key === 'Backspace') {
      if (!currentText && items.length > 1) {
        e.preventDefault();
        const updated = items.filter((_, i) => i !== index);
        onUpdate({ items: updated });
        setTimeout(() => {
          itemRefs.current[Math.max(0, index - 1)]?.focus();
        }, 0);
        return;
      } else if (!currentText && items.length === 1) {
        e.preventDefault();
        onRemove();
        return;
      }
    }
  };

  return (
    <div onClick={onFocus} className="my-4 py-1">
      {isNumbered ? (
        <ol className="list-decimal list-outside pl-6 space-y-2 text-[#211E1A] text-[18px] leading-[1.75]">
          {items.map((item, idx) => (
            <li key={idx} className="pl-1">
              <div
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleItemChange(idx, e.currentTarget.innerHTML)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                data-placeholder="List item..."
                dangerouslySetInnerHTML={{ __html: item }}
                className={`outline-none focus:outline-none min-h-[1.5rem] ${
                  !item ? 'before:content-[attr(data-placeholder)] before:text-[#716D65]/40 before:pointer-events-none' : ''
                }`}
              />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc list-outside pl-6 space-y-2 text-[#211E1A] text-[18px] leading-[1.75]">
          {items.map((item, idx) => (
            <li key={idx} className="pl-1">
              <div
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleItemChange(idx, e.currentTarget.innerHTML)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                data-placeholder="List item..."
                dangerouslySetInnerHTML={{ __html: item }}
                className={`outline-none focus:outline-none min-h-[1.5rem] ${
                  !item ? 'before:content-[attr(data-placeholder)] before:text-[#716D65]/40 before:pointer-events-none' : ''
                }`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
