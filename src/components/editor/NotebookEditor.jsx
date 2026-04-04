import { useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import EditorToolbar from './EditorToolbar'
import DrawingOverlay from './DrawingOverlay'
import { useAutoSave } from '@/hooks/useAutoSave'
import './editor.css'

export default function NotebookEditor({ content, onSave, onUploadImage, onInsertDrawing, annotating, onToggleAnnotation, overlayStrokes, onOverlayStrokesChange }) {
  const { debouncedSave, flush } = useAutoSave(onSave)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
      Image,
      Placeholder.configure({ placeholder: 'Comece a escrever...' }),
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content && Object.keys(content).length > 0 ? content : undefined,
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON())
    },
  })

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      flush()
    }
  }, [flush])

  const handleUploadImage = useCallback(
    async (file) => {
      if (!onUploadImage || !editor) return
      const result = await onUploadImage(file)
      if (result?.url) {
        editor.chain().focus().setImage({ src: result.url }).run()
      }
    },
    [onUploadImage, editor]
  )

  return (
    <div>
      <EditorToolbar
        editor={editor}
        onUploadImage={handleUploadImage}
        onInsertDrawing={onInsertDrawing}
        annotating={annotating}
        onToggleAnnotation={onToggleAnnotation}
      />
      <div className={`relative ${annotating ? 'prose-editor-annotating' : ''}`}>
        <EditorContent editor={editor} className="prose-editor" />
        <DrawingOverlay
          active={annotating}
          strokes={overlayStrokes}
          onStrokesChange={onOverlayStrokesChange}
        />
      </div>
    </div>
  )
}
