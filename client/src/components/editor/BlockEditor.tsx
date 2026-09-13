import { useState, useRef, useCallback } from 'react';
import type { Block, BlockType, UnsplashPhoto } from './types.js';
import { ParagraphBlock } from './blocks/ParagraphBlock.js';
import { HeadingBlock } from './blocks/HeadingBlock.js';
import { QuoteBlock } from './blocks/QuoteBlock.js';
import { ImageBlock } from './blocks/ImageBlock.js';
import { CodeBlock } from './blocks/CodeBlock.js';
import { VideoBlock } from './blocks/VideoBlock.js';
import { EmbedBlock } from './blocks/EmbedBlock.js';
import { DividerBlock } from './blocks/DividerBlock.js';
import { ListBlock } from './blocks/ListBlock.js';
import { CalloutBlock } from './blocks/CalloutBlock.js';
import { SectionBlock } from './blocks/SectionBlock.js';
import { BlockControlsMenu } from './BlockControlsMenu.js';
import { PlusButtonMenu } from './PlusButtonMenu.js';
import { SlashCommandMenu } from './SlashCommandMenu.js';
import { FloatingToolbar } from './FloatingToolbar.js';
import { UnsplashDialog } from './dialogs/UnsplashDialog.js';
import { VideoDialog } from './dialogs/VideoDialog.js';
import { EmbedDialog } from './dialogs/EmbedDialog.js';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  // Slash menu state
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    blockIndex: number;
    position: { top: number; left: number };
    query: string;
  } | null>(null);

  // Plus menu active index (which block's plus button was clicked)
  const [activePlusIndex, setActivePlusIndex] = useState<number | null>(null);

  // Dialogs state
  const [unsplashOpen, setUnsplashOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [dialogTargetIndex, setDialogTargetIndex] = useState<number>(0);
  const [editTargetBlockId, setEditTargetBlockId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const generateId = () => 'b-' + Math.random().toString(36).substring(2, 9);

  // Ensure there's always at least one block
  const safeBlocks: Block[] =
    blocks.length > 0
      ? blocks
      : [{ id: generateId(), type: 'paragraph', content: '' }];

  const updateBlock = useCallback(
    (id: string, updates: Partial<Block>) => {
      const updated = safeBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
      onChange(updated);
    },
    [safeBlocks, onChange]
  );

  const insertBlockAfter = useCallback(
    (index: number, type: BlockType, extra: Partial<Block> = {}) => {
      const newBlock: Block = {
        id: generateId(),
        type,
        content: '',
        ...extra,
      };
      const updated = [...safeBlocks];
      updated.splice(index + 1, 0, newBlock);
      onChange(updated);
      setFocusedBlockId(newBlock.id);
      setActivePlusIndex(null);
    },
    [safeBlocks, onChange]
  );

  const removeBlock = useCallback(
    (id: string) => {
      if (safeBlocks.length <= 1) {
        // Reset single remaining block instead of deleting everything
        onChange([{ id: generateId(), type: 'paragraph', content: '' }]);
        return;
      }
      const index = safeBlocks.findIndex((b) => b.id === id);
      const prevBlock = index > 0 ? safeBlocks[index - 1] : safeBlocks[index + 1];
      const updated = safeBlocks.filter((b) => b.id !== id);
      onChange(updated);
      if (prevBlock) {
        setFocusedBlockId(prevBlock.id);
      }
    },
    [safeBlocks, onChange]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const index = safeBlocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const original = safeBlocks[index];
      const copy: Block = {
        ...original,
        id: generateId(),
      };
      const updated = [...safeBlocks];
      updated.splice(index + 1, 0, copy);
      onChange(updated);
      setFocusedBlockId(copy.id);
    },
    [safeBlocks, onChange]
  );

  const moveBlock = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= safeBlocks.length) return;
      const updated = [...safeBlocks];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      onChange(updated);
    },
    [safeBlocks, onChange]
  );

  const convertBlockType = useCallback(
    (id: string, newType: BlockType) => {
      const updated = safeBlocks.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          type: newType,
          level: (newType === 'heading' ? 2 : undefined) as 1 | 2 | 3 | undefined,
        };
      });
      onChange(updated);
    },
    [safeBlocks, onChange]
  );

  // Handle Slash Command Selection
  const handleSlashSelect = (type: BlockType, extra?: Record<string, any>) => {
    if (!slashMenu) return;
    const targetIdx = slashMenu.blockIndex;
    const targetBlock = safeBlocks[targetIdx];

    // Clear slash command menu
    setSlashMenu(null);

    // If modal dialogs are needed
    if (type === 'image' && extra?.isUnsplash) {
      setDialogTargetIndex(targetIdx);
      setUnsplashOpen(true);
      return;
    }
    if (type === 'video') {
      setDialogTargetIndex(targetIdx);
      setVideoDialogOpen(true);
      return;
    }
    if (type === 'embed') {
      setDialogTargetIndex(targetIdx);
      setEmbedDialogOpen(true);
      return;
    }

    // Otherwise convert current block to the selected type
    const updated = [...safeBlocks];
    updated[targetIdx] = {
      ...targetBlock,
      type,
      content: '', // Reset slash text
      ...extra,
    };
    onChange(updated);
    setFocusedBlockId(targetBlock.id);
  };

  // Handle Plus Menu Block Insertion
  const handlePlusInsert = (type: BlockType, index: number, extra?: Record<string, any>) => {
    setActivePlusIndex(null);

    if (type === 'image' && extra?.isUnsplash) {
      setDialogTargetIndex(index);
      setUnsplashOpen(true);
      return;
    }
    if (type === 'video') {
      setDialogTargetIndex(index);
      setVideoDialogOpen(true);
      return;
    }
    if (type === 'embed') {
      setDialogTargetIndex(index);
      setEmbedDialogOpen(true);
      return;
    }

    insertBlockAfter(index, type, extra);
  };

  // Unsplash selection callback
  const handleSelectUnsplash = (photo: UnsplashPhoto) => {
    const newBlock: Block = {
      id: generateId(),
      type: 'image',
      url: photo.url,
      caption: photo.alt,
      photographerName: photo.photographerName,
      photographerUrl: photo.photographerUrl,
      unsplashUrl: photo.unsplashUrl,
      width: 'normal',
    };
    const updated = [...safeBlocks];
    updated.splice(dialogTargetIndex + 1, 0, newBlock);
    onChange(updated);
  };

  // Video insertion callback
  const handleInsertVideo = (url: string, caption?: string) => {
    if (editTargetBlockId) {
      updateBlock(editTargetBlockId, { url, caption });
      setEditTargetBlockId(null);
      return;
    }
    const newBlock: Block = {
      id: generateId(),
      type: 'video',
      url,
      caption,
    };
    const updated = [...safeBlocks];
    updated.splice(dialogTargetIndex + 1, 0, newBlock);
    onChange(updated);
  };

  // Embed insertion callback
  const handleInsertEmbed = (url: string, caption?: string, provider?: string) => {
    if (editTargetBlockId) {
      updateBlock(editTargetBlockId, { url, caption, provider });
      setEditTargetBlockId(null);
      return;
    }
    const newBlock: Block = {
      id: generateId(),
      type: 'embed',
      url,
      caption,
      provider,
    };
    const updated = [...safeBlocks];
    updated.splice(dialogTargetIndex + 1, 0, newBlock);
    onChange(updated);
  };

  // Floating toolbar formatting execution
  const handleFormat = (action: string, value?: string) => {
    if (action === 'h1' || action === 'h2' || action === 'quote') {
      if (focusedBlockId) {
        if (action === 'quote') {
          convertBlockType(focusedBlockId, 'quote');
        } else {
          updateBlock(focusedBlockId, {
            type: 'heading',
            level: action === 'h1' ? 1 : 2,
          });
        }
      }
      return;
    }

    // Native browser formatting commands
    if (action === 'link') {
      document.execCommand('createLink', false, value || '#');
    } else {
      document.execCommand(action, false, value);
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...safeBlocks];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);
    onChange(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Floating Toolbar on text selection */}
      <FloatingToolbar onFormat={handleFormat} containerRef={containerRef} />

      {/* Block List */}
      <div className="space-y-1">
        {safeBlocks.map((block, idx) => {
          const isFocused = focusedBlockId === block.id;
          const isDragging = draggedIndex === idx;
          const isOver = dragOverIndex === idx;

          return (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={`relative group/row flex items-start transition-all ${
                isDragging ? 'opacity-30' : ''
              } ${isOver ? 'border-t-2 border-[#211E1A]' : ''}`}
            >
              {/* Left Gutter: Controls & Plus Button */}
              <div className="hidden sm:flex items-center gap-1 -ml-16 pr-3 pt-2 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity select-none shrink-0 w-16 justify-end">
                {/* Plus Button */}
                <div className="relative">
                  <PlusButtonMenu
                    isOpen={activePlusIndex === idx}
                    onToggle={() => setActivePlusIndex(activePlusIndex === idx ? null : idx)}
                    onInsertBlock={(type, extra) => handlePlusInsert(type, idx, extra)}
                  />
                </div>

                {/* Block Controls Menu (drag handle & 3-dot) */}
                <BlockControlsMenu
                  canMoveUp={idx > 0}
                  canMoveDown={idx < safeBlocks.length - 1}
                  onMoveUp={() => moveBlock(idx, 'up')}
                  onMoveDown={() => moveBlock(idx, 'down')}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onDelete={() => removeBlock(block.id)}
                  onConvertType={(type) => convertBlockType(block.id, type)}
                />
              </div>

              {/* Block Content Canvas */}
              <div className="flex-1 min-w-0">
                {block.type === 'paragraph' && (
                  <ParagraphBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onEnter={() => insertBlockAfter(idx, 'paragraph')}
                    onBackspaceEmpty={() => removeBlock(block.id)}
                    onSlashTrigger={(rect) => {
                      setSlashMenu({
                        isOpen: true,
                        blockIndex: idx,
                        position: { top: rect.bottom + 6, left: rect.left },
                        query: '',
                      });
                    }}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'heading' && (
                  <HeadingBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onEnter={() => insertBlockAfter(idx, 'paragraph')}
                    onBackspaceEmpty={() => removeBlock(block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'quote' && (
                  <QuoteBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onEnter={() => insertBlockAfter(idx, 'paragraph')}
                    onBackspaceEmpty={() => removeBlock(block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'image' && (
                  <ImageBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onRemove={() => removeBlock(block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'code' && (
                  <CodeBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'video' && (
                  <VideoBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onRemove={() => removeBlock(block.id)}
                    onEditUrl={() => {
                      setEditTargetBlockId(block.id);
                      setVideoDialogOpen(true);
                    }}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'embed' && (
                  <EmbedBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onRemove={() => removeBlock(block.id)}
                    onEditUrl={() => {
                      setEditTargetBlockId(block.id);
                      setEmbedDialogOpen(true);
                    }}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'divider' && (
                  <DividerBlock
                    block={block}
                    isFocused={isFocused}
                    onRemove={() => removeBlock(block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'list' && (
                  <ListBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onExitList={() => insertBlockAfter(idx, 'paragraph')}
                    onRemove={() => removeBlock(block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'callout' && (
                  <CalloutBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onEnter={() => insertBlockAfter(idx, 'paragraph')}
                    onBackspaceEmpty={() => removeBlock(block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}

                {block.type === 'section' && (
                  <SectionBlock
                    block={block}
                    isFocused={isFocused}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onEnter={() => insertBlockAfter(idx, 'paragraph')}
                    onBackspaceEmpty={() => removeBlock(block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slash Command Menu Portal */}
      {slashMenu && slashMenu.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: `${slashMenu.position.top}px`,
            left: `${slashMenu.position.left}px`,
            zIndex: 60,
          }}
        >
          <SlashCommandMenu
            query={slashMenu.query}
            onSelect={handleSlashSelect}
            onClose={() => setSlashMenu(null)}
          />
        </div>
      )}

      {/* Unsplash Modal */}
      <UnsplashDialog
        isOpen={unsplashOpen}
        onClose={() => setUnsplashOpen(false)}
        onSelect={handleSelectUnsplash}
      />

      {/* Video Modal */}
      <VideoDialog
        isOpen={videoDialogOpen}
        onClose={() => {
          setVideoDialogOpen(false);
          setEditTargetBlockId(null);
        }}
        onInsert={handleInsertVideo}
        initialUrl={editTargetBlockId ? safeBlocks.find((b) => b.id === editTargetBlockId)?.url : ''}
        initialCaption={editTargetBlockId ? safeBlocks.find((b) => b.id === editTargetBlockId)?.caption : ''}
      />

      {/* Embed Modal */}
      <EmbedDialog
        isOpen={embedDialogOpen}
        onClose={() => {
          setEmbedDialogOpen(false);
          setEditTargetBlockId(null);
        }}
        onInsert={handleInsertEmbed}
        initialUrl={editTargetBlockId ? safeBlocks.find((b) => b.id === editTargetBlockId)?.url : ''}
        initialCaption={editTargetBlockId ? safeBlocks.find((b) => b.id === editTargetBlockId)?.caption : ''}
      />
    </div>
  );
}
